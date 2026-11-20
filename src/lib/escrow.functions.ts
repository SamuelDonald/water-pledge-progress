import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Role = "admin" | "realtor" | "buyer" | "escrow_officer";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function rolesOf(supabase: any, userId: string): Promise<Role[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: { role: Role }) => r.role);
}
async function audit(transactionId: string | null, actorId: string, action: string, detail: Record<string, unknown> = {}) {
  const db = await admin();
  await db.from("audit_events").insert({ transaction_id: transactionId, actor_id: actorId, action, detail: detail as any });
}
async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    let roles = await rolesOf(supabase, userId);
    if (roles.length === 0) {
      const db = await admin();
      await db.from("profiles").upsert({ id: userId, email: (claims as any).email ?? null });
      await db.from("user_roles").insert({ user_id: userId, role: "buyer" });
      roles = ["buyer"];
    }
    const { data: application } = await supabase.from("realtor_applications").select("*").eq("user_id", userId).maybeSingle();
    return { userId, email: ((claims as any).email as string) ?? "", roles, application };
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data, context }) => {
    const expected = process.env["ADMIN_PASSWORD"];
    if (!expected || data.password !== expected) throw new Error("Incorrect administrator access code.");
    const db = await admin();
    await db.from("user_roles").upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    await audit(null, context.userId, "admin_role_granted");
    return { ok: true };
  });

export const applyAsRealtor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fullName: string; brokerage: string; licenseNumber: string; phone?: string; markets?: string }) => d)
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      full_name: clean(data.fullName, 120),
      brokerage: clean(data.brokerage, 160),
      license_number: clean(data.licenseNumber, 40),
      phone: clean(data.phone, 40) || null,
      markets: clean(data.markets, 300) || null,
    };
    if (!row.full_name || !row.brokerage || !row.license_number) throw new Error("Name, brokerage and license number are required.");
    const { error } = await context.supabase.from("realtor_applications").insert(row);
    if (error) throw new Error(error.code === "23505" ? "You have already applied." : error.message);
    await audit(null, context.userId, "realtor_applied");
    return { ok: true };
  });

export const listMyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("escrow_transactions").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { buyerEmail: string; propertyAddress: string; city: string; zip?: string; transactionType: string; depositAmount: number; paymentDeadline?: string; releaseConditions?: string; refundConditions?: string }) => d)
  .handler(async ({ data, context }) => {
    const roles = await rolesOf(context.supabase, context.userId);
    if (!roles.includes("realtor")) throw new Error("Only approved realtors can create transactions.");
    const email = clean(data.buyerEmail, 200).toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid buyer email.");
    const cents = Math.round(Number(data.depositAmount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) throw new Error("Enter a valid deposit amount.");
    if (!clean(data.propertyAddress) || !clean(data.city)) throw new Error("Property address and city are required.");
    const db = await admin();
    const { data: tx, error } = await db.from("escrow_transactions").insert({
      realtor_id: context.userId,
      buyer_email: email,
      property_address: clean(data.propertyAddress, 200),
      city: clean(data.city, 80),
      zip: clean(data.zip, 10) || null,
      transaction_type: clean(data.transactionType, 40) || "earnest_money",
      deposit_amount_cents: cents,
      payment_deadline: data.paymentDeadline || null,
      release_conditions: clean(data.releaseConditions, 2000) || null,
      refund_conditions: clean(data.refundConditions, 2000) || null,
    }).select("*").single();
    if (error || !tx) throw new Error(error?.message ?? "Could not create transaction.");
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
    await db.from("transaction_invitations").insert({ transaction_id: tx.id, email, token_hash: await sha256(token) });
    await audit(tx.id, context.userId, "transaction_created", { reference: tx.reference });
    // Email delivery is a placeholder: the realtor copies and shares the invitation link.
    return { transaction: tx, inviteToken: token };
  });

export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: inv } = await db.from("transaction_invitations").select("*").eq("token_hash", await sha256(clean(data.token, 100))).maybeSingle();
    if (!inv || inv.revoked_at || new Date(inv.expires_at) < new Date()) throw new Error("This invitation is invalid or has expired.");
    const email = String((context.claims as any).email ?? "").toLowerCase();
    if (email !== inv.email.toLowerCase()) throw new Error("This invitation was sent to a different email address.");
    if (!inv.accepted_at) {
      await db.from("transaction_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", inv.id);
      await db.from("escrow_transactions").update({ buyer_id: context.userId, status: "awaiting_payment" }).eq("id", inv.transaction_id);
      await audit(inv.transaction_id, context.userId, "invitation_accepted");
    }
    return { transactionId: inv.transaction_id as string };
  });

export const getTransaction = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { data: tx } = await s.from("escrow_transactions").select("*").eq("id", data.id).maybeSingle();
    if (!tx) throw new Error("Transaction not found.");
    const [p, r, a] = await Promise.all([
      s.from("payment_records").select("*").eq("transaction_id", data.id).order("created_at"),
      s.from("release_requests").select("*").eq("transaction_id", data.id).order("created_at"),
      s.from("audit_events").select("*").eq("transaction_id", data.id).order("created_at", { ascending: false }),
    ]);
    const roles = await rolesOf(s, context.userId);
    return { tx, payments: p.data ?? [], releases: r.data ?? [], audit: a.data ?? [], viewer: { userId: context.userId, roles } };
  });

export const choosePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string; method: "wire" | "crypto"; reference?: string }) => d)
  .handler(async ({ data, context }) => {
    if (data.method !== "wire" && data.method !== "crypto") throw new Error("Unknown payment method.");
    const { data: tx } = await context.supabase.from("escrow_transactions").select("*").eq("id", data.transactionId).maybeSingle();
    if (!tx || tx.buyer_id !== context.userId) throw new Error("Only the invited buyer can submit payment.");
    const db = await admin();
    const ref = clean(data.reference, 200);
    await db.from("payment_records").insert({
      transaction_id: tx.id, method: data.method, amount_cents: tx.deposit_amount_cents,
      status: ref ? "submitted" : "instructions_pending", buyer_reference: ref || null, submitted_by: context.userId,
    });
    if (ref) await db.from("escrow_transactions").update({ status: "payment_submitted" }).eq("id", tx.id);
    await audit(tx.id, context.userId, ref ? "payment_reference_submitted" : "payment_method_selected", { method: data.method });
    return { ok: true };
  });

export const buyerConfirm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: tx } = await context.supabase.from("escrow_transactions").select("*").eq("id", data.transactionId).maybeSingle();
    if (!tx || tx.buyer_id !== context.userId) throw new Error("Only the invited buyer can confirm.");
    if (tx.status !== "funds_secured") throw new Error("Confirmation opens once funds are verified.");
    const db = await admin();
    await db.from("escrow_transactions").update({ status: "buyer_confirmed", buyer_confirmed_at: new Date().toISOString() }).eq("id", tx.id);
    await audit(tx.id, context.userId, "buyer_confirmed");
    return { ok: true };
  });

export const requestRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string; reason: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: tx } = await context.supabase.from("escrow_transactions").select("*").eq("id", data.transactionId).maybeSingle();
    if (!tx || tx.realtor_id !== context.userId) throw new Error("Only the transaction's realtor can request release.");
    if (tx.status !== "buyer_confirmed") throw new Error("Release can be requested after the buyer confirms.");
    const reason = clean(data.reason, 2000);
    if (!reason) throw new Error("Add a reason for the release.");
    const db = await admin();
    await db.from("release_requests").insert({ transaction_id: tx.id, requested_by: context.userId, reason });
    await db.from("escrow_transactions").update({ status: "release_requested" }).eq("id", tx.id);
    await audit(tx.id, context.userId, "release_requested");
    return { ok: true };
  });

// ---------- Administrator ----------
async function requireAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Administrator access required.");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const s = context.supabase;
    const [apps, txs, pays, rels] = await Promise.all([
      s.from("realtor_applications").select("*").order("created_at", { ascending: false }),
      s.from("escrow_transactions").select("*").order("created_at", { ascending: false }),
      s.from("payment_records").select("*").eq("status", "submitted").order("created_at"),
      s.from("release_requests").select("*").eq("status", "pending").order("created_at"),
    ]);
    return { applications: apps.data ?? [], transactions: txs.data ?? [], payments: pays.data ?? [], releases: rels.data ?? [] };
  });

export const adminDecideApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; decision: "approved" | "rejected" | "suspended"; note?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: app } = await db.from("realtor_applications").update({ status: data.decision, reviewed_by: context.userId, reviewed_at: new Date().toISOString(), review_note: clean(data.note) || null }).eq("id", data.id).select("*").single();
    if (!app) throw new Error("Application not found.");
    if (data.decision === "approved") await db.from("user_roles").upsert({ user_id: app.user_id, role: "realtor" }, { onConflict: "user_id,role" });
    else await db.from("user_roles").delete().eq("user_id", app.user_id).eq("role", "realtor");
    await audit(null, context.userId, "realtor_" + data.decision, { applicationId: app.id });
    return { ok: true };
  });

export const adminVerifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { paymentId: string; decision: "verified" | "rejected" }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: pay } = await db.from("payment_records").update({ status: data.decision, verified_by: context.userId, verified_at: new Date().toISOString() }).eq("id", data.paymentId).select("*").single();
    if (!pay) throw new Error("Payment not found.");
    await db.from("escrow_transactions").update({ status: data.decision === "verified" ? "funds_secured" : "awaiting_payment" }).eq("id", pay.transaction_id);
    await audit(pay.transaction_id, context.userId, "payment_" + data.decision);
    return { ok: true };
  });

export const adminDecideRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { releaseId: string; decision: "approved" | "rejected"; note?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: rel } = await db.from("release_requests").select("*").eq("id", data.releaseId).single();
    if (!rel) throw new Error("Release request not found.");
    if (rel.requested_by === context.userId) throw new Error("You cannot approve a release you requested.");
    await db.from("release_requests").update({ status: data.decision, decided_by: context.userId, decided_at: new Date().toISOString(), decision_note: clean(data.note) || null }).eq("id", rel.id);
    await db.from("escrow_transactions").update({ status: data.decision === "approved" ? "release_authorized" : "buyer_confirmed" }).eq("id", rel.transaction_id);
    await audit(rel.transaction_id, context.userId, "release_" + data.decision);
    return { ok: true };
  });
