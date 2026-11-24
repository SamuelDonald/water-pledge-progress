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
      await db.from("user_roles").upsert({ user_id: userId, role: "buyer" }, { onConflict: "user_id,role" });
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
    const { count } = await db.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) {
      const { data: alreadyAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
      if (!alreadyAdmin) throw new Error("Initial administrator setup has already been completed.");
    }
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
    const [p, r, a, d, x] = await Promise.all([
      s.from("payment_records").select("*").eq("transaction_id", data.id).order("created_at"),
      s.from("release_requests").select("*").eq("transaction_id", data.id).order("created_at"),
      s.from("audit_events").select("*").eq("transaction_id", data.id).order("created_at", { ascending: false }),
      s.from("transaction_documents").select("*").eq("transaction_id", data.id).order("created_at", { ascending: false }),
      s.from("disbursement_records").select("*").eq("transaction_id", data.id).order("recorded_at", { ascending: false }),
    ]);
    const roles = await rolesOf(s, context.userId);
    const db = await admin();
    const documents = await Promise.all((d.data ?? []).map(async (doc) => {
      const { data: signed } = await db.storage.from("escrow-transaction-documents").createSignedUrl(doc.storage_path, 300);
      return { ...doc, signedUrl: signed?.signedUrl ?? null };
    }));
    return { tx, payments: p.data ?? [], releases: r.data ?? [], audit: a.data ?? [], documents, disbursements: x.data ?? [], viewer: { userId: context.userId, roles } };
  });

const allowedDocumentTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxDocumentSize = 15 * 1024 * 1024;

export const createDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string; fileName: string; mimeType: string; fileSize: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: tx } = await context.supabase.from("escrow_transactions").select("id").eq("id", data.transactionId).maybeSingle();
    if (!tx) throw new Error("You do not have access to this transaction.");
    const fileName = clean(data.fileName, 180).replace(/[^a-zA-Z0-9._-]/g, "-");
    if (!fileName || !allowedDocumentTypes.includes(data.mimeType)) throw new Error("Upload a PDF, JPG, or PNG document.");
    if (!Number.isFinite(data.fileSize) || data.fileSize <= 0 || data.fileSize > maxDocumentSize) throw new Error("Documents must be no larger than 15 MB.");
    const path = `${data.transactionId}/${crypto.randomUUID()}-${fileName}`;
    const db = await admin();
    const { data: signed, error } = await db.storage.from("escrow-transaction-documents").createSignedUploadUrl(path);
    if (error) throw new Error("Could not prepare a secure document upload.");
    return { path, token: signed.token };
  });

export const completeDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string; path: string; fileName: string; mimeType: string; fileSize: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: tx } = await context.supabase.from("escrow_transactions").select("id").eq("id", data.transactionId).maybeSingle();
    if (!tx || !data.path.startsWith(`${data.transactionId}/`) || !allowedDocumentTypes.includes(data.mimeType)) throw new Error("The uploaded document could not be verified.");
    if (!Number.isFinite(data.fileSize) || data.fileSize <= 0 || data.fileSize > maxDocumentSize) throw new Error("Document size is outside the allowed limit.");
    const db = await admin();
    const { data: file, error: downloadError } = await db.storage.from("escrow-transaction-documents").download(data.path);
    if (downloadError || !file || file.size !== data.fileSize) throw new Error("The uploaded file is missing or incomplete.");
    const { error } = await db.from("transaction_documents").insert({
      transaction_id: data.transactionId,
      uploaded_by: context.userId,
      storage_path: data.path,
      file_name: clean(data.fileName, 180),
      mime_type: data.mimeType,
      file_size_bytes: data.fileSize,
    });
    if (error) throw new Error("Could not attach the document to this transaction.");
    await audit(data.transactionId, context.userId, "document_uploaded", { fileName: clean(data.fileName, 180) });
    return { ok: true };
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
    const { data: tx } = await db.from("escrow_transactions").select("status").eq("id", rel.transaction_id).single();
    if (data.decision === "approved" && (rel.status !== "pending" || tx?.status !== "release_requested")) {
      throw new Error("This release is no longer waiting for administrator review.");
    }
    await db.from("release_requests").update({ status: data.decision, decided_by: context.userId, decided_at: new Date().toISOString(), decision_note: clean(data.note) || null }).eq("id", rel.id);
    await db.from("escrow_transactions").update({ status: data.decision === "approved" ? "release_authorized" : "buyer_confirmed" }).eq("id", rel.transaction_id);
    await audit(rel.transaction_id, context.userId, "release_" + data.decision);
    return { ok: true };
  });

export const officerOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await rolesOf(context.supabase, context.userId);
    if (!roles.includes("escrow_officer") && !roles.includes("admin")) throw new Error("Escrow officer access required.");
    const s = context.supabase;
    const [txs, releases, records] = await Promise.all([
      s.from("escrow_transactions").select("*").in("status", ["release_authorized", "completed"]).order("updated_at", { ascending: false }),
      s.from("release_requests").select("*").eq("status", "approved").order("decided_at", { ascending: false }),
      s.from("disbursement_records").select("*").order("recorded_at", { ascending: false }),
    ]);
    return { transactions: txs.data ?? [], releases: releases.data ?? [], disbursements: records.data ?? [] };
  });

export const recordDisbursement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { releaseId: string; recipientName: string; reference: string; notes?: string }) => d)
  .handler(async ({ data, context }) => {
    const roles = await rolesOf(context.supabase, context.userId);
    if (!roles.includes("escrow_officer") && !roles.includes("admin")) throw new Error("Escrow officer access required.");
    const db = await admin();
    const { data: release } = await db.from("release_requests").select("*").eq("id", data.releaseId).single();
    if (!release || release.status !== "approved") throw new Error("Only administrator-approved releases can be recorded.");
    const { data: tx } = await db.from("escrow_transactions").select("*").eq("id", release.transaction_id).single();
    if (!tx || tx.status !== "release_authorized") throw new Error("This transaction is not authorized for disbursement.");
    const { data: existing } = await db.from("disbursement_records").select("id").eq("release_request_id", release.id).maybeSingle();
    if (existing) throw new Error("A disbursement is already recorded for this release.");
    const recipientName = clean(data.recipientName, 160);
    const reference = clean(data.reference, 160);
    if (!recipientName || !reference) throw new Error("Recipient and transfer reference are required.");
    const { error } = await db.from("disbursement_records").insert({
      transaction_id: tx.id,
      release_request_id: release.id,
      recorded_by: context.userId,
      recipient_name: recipientName,
      amount_cents: tx.deposit_amount_cents,
      reference,
      notes: clean(data.notes, 1000) || null,
    });
    if (error) throw new Error("Could not record this disbursement.");
    await db.from("escrow_transactions").update({ status: "completed" }).eq("id", tx.id);
    await audit(tx.id, context.userId, "disbursement_recorded", { releaseId: release.id, recipientName, reference });
    return { ok: true };
  });
