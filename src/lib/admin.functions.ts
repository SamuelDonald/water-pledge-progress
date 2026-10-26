import { createServerFn } from "@tanstack/react-start";

const TTL = 1000 * 60 * 60 * 12;

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function secret() {
  const s = process.env["ADMIN_PASSWORD"];
  if (!s) throw new Error("Admin password not configured");
  return s;
}
async function verify(token: unknown) {
  const [exp, sig] = String(token ?? "").split(".");
  if (!exp || !sig || Number(exp) < Date.now()) throw new Error("UNAUTHORIZED");
  if (!safeEq(await hmac(secret(), "admin:" + exp), sig)) throw new Error("UNAUTHORIZED");
}
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}
const tok = (d: any) => String(d?.token ?? "");

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "").slice(0, 200) }))
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!safeEq(data.password, secret())) throw new Error("Incorrect password");
    const exp = String(Date.now() + TTL);
    return { token: exp + "." + (await hmac(secret(), "admin:" + exp)) };
  });

export const adminCheck = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: tok(d) }))
  .handler(async ({ data }) => { try { await verify(data.token); return { ok: true }; } catch { return { ok: false }; } });

const LOC = ["Dallas", "Houston", "Rio Grande Valley"], STATUS = ["For Sale", "For Rent", "Sold", "Rented"], TYPES = ["House", "Condo", "Apartment", "Multi-family", "Land", "Commercial"];
function clean(p: any) {
  const num = (v: any) => (v === "" || v == null ? 0 : Number(v) || 0);
  const nul = (v: any) => (v === "" || v == null ? null : Number(v));
  const title = String(p.title ?? "").trim().slice(0, 200);
  if (title.length < 2) throw new Error("Title is required");
  if (!LOC.includes(p.location)) throw new Error("Invalid location");
  const slug = (String(p.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "property").slice(0, 120);
  return {
    title, slug, location: p.location, city: String(p.city ?? "").slice(0, 120),
    status: STATUS.includes(p.status) ? p.status : "For Sale",
    property_type: TYPES.includes(p.property_type) ? p.property_type : "House",
    price: num(p.price), bedrooms: Math.round(num(p.bedrooms)), bathrooms: num(p.bathrooms), sqft: Math.round(num(p.sqft)),
    lot_size: nul(p.lot_size), latitude: nul(p.latitude), longitude: nul(p.longitude),
    description: String(p.description ?? "").slice(0, 10000), neighborhood: String(p.neighborhood ?? "") || null,
    address: String(p.address ?? "") || null, is_featured: !!p.is_featured, is_published: !!p.is_published,
  };
}

export const adminListProperties = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: tok(d) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const { data: rows, error } = await db.from("properties").select("*, property_media(*)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    for (const p of rows ?? []) {
      p.media = (p.property_media ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
      delete p.property_media;
      for (const m of p.media) if (m.storage_path) {
        const { data: s } = await db.storage.from("property-media").createSignedUrl(m.storage_path, 3600);
        m.url = s?.signedUrl ?? m.url;
      }
    }
    return rows ?? [];
  });

export const adminSaveProperty = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id?: string | null; property: any }) => ({ token: tok(d), id: d.id ? String(d.id) : null, property: d.property }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const row = clean(data.property);
    const q = data.id ? db.from("properties").update(row).eq("id", data.id) : db.from("properties").insert(row);
    const { data: saved, error } = await q.select("id").single();
    if (error) throw new Error(error.code === "23505" ? "That URL slug is already used" : error.message);
    return { id: saved.id as string };
  });

export const adminDeleteProperty = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string }) => ({ token: tok(d), id: String(d.id) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const { data: media } = await db.from("property_media").select("storage_path").eq("property_id", data.id);
    const paths = (media ?? []).map((m: any) => m.storage_path).filter(Boolean);
    if (paths.length) await db.storage.from("property-media").remove(paths);
    const { error } = await db.from("properties").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateUpload = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; propertyId: string; filename: string }) => ({ token: tok(d), propertyId: String(d.propertyId), filename: String(d.filename).slice(0, 120) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const path = `${data.propertyId}/${crypto.randomUUID()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { data: s, error } = await db.storage.from("property-media").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: s.token as string };
  });

export const adminAddMedia = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; propertyId: string; path: string; mediaType: string; caption: string }) => ({ token: tok(d), propertyId: String(d.propertyId), path: String(d.path), mediaType: d.mediaType === "video" ? "video" : "image", caption: String(d.caption ?? "").slice(0, 200) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    if (!data.path.startsWith(data.propertyId + "/")) throw new Error("Invalid path");
    const db = await admin();
    const { count } = await db.from("property_media").select("id", { count: "exact", head: true }).eq("property_id", data.propertyId);
    const { error } = await db.from("property_media").insert({ property_id: data.propertyId, storage_path: data.path, url: "", media_type: data.mediaType, caption: data.caption, sort_order: count ?? 0 });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMediaAction = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; action: "delete" | "cover" }) => ({ token: tok(d), id: String(d.id), action: d.action === "cover" ? "cover" : "delete" }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const { data: m } = await db.from("property_media").select("*").eq("id", data.id).single();
    if (!m) throw new Error("Not found");
    if (data.action === "delete") {
      if (m.storage_path) await db.storage.from("property-media").remove([m.storage_path]);
      await db.from("property_media").delete().eq("id", data.id);
    } else {
      const { data: all } = await db.from("property_media").select("id").eq("property_id", m.property_id).order("sort_order");
      const ids = [data.id, ...(all ?? []).map((x: any) => x.id).filter((x: string) => x !== data.id)];
      for (let i = 0; i < ids.length; i++) await db.from("property_media").update({ sort_order: i }).eq("id", ids[i]);
    }
    return { ok: true };
  });

export const adminListInquiries = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: tok(d) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const { data: rows, error } = await db.from("inquiries").select("*, properties(title, slug)").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; status: string; notes?: string }) => ({ token: tok(d), id: String(d.id), status: ["new", "contacted", "archived"].includes(d.status) ? d.status : "new", notes: d.notes == null ? undefined : String(d.notes).slice(0, 2000) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const patch: any = { status: data.status };
    if (data.notes !== undefined) patch.admin_notes = data.notes;
    const { error } = await db.from("inquiries").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const adminListBuyerRequests = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; status?: string }) => ({ token: tok(d), status: d.status ? String(d.status) : "" }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    let query = db.from("buyer_requests").select("*").order("created_at", { ascending: false }).limit(500);
    if (["new", "reviewing", "contacted", "matched", "closed"].includes(data.status)) query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminUpdateBuyerRequest = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; status: string; notes?: string; assignedTo?: string }) => ({
    token: tok(d), id: String(d.id), status: String(d.status),
    notes: d.notes === undefined ? undefined : String(d.notes).slice(0, 4000),
    assignedTo: d.assignedTo === undefined ? undefined : String(d.assignedTo).slice(0, 120),
  }))
  .handler(async ({ data }) => {
    await verify(data.token);
    if (!["new", "reviewing", "contacted", "matched", "closed"].includes(data.status)) throw new Error("Invalid status");
    const db = await admin();
    const patch: any = { status: data.status };
    if (data.notes !== undefined) patch.admin_notes = data.notes;
    if (data.assignedTo !== undefined) patch.assigned_to = data.assignedTo || null;
    const { error } = await db.from("buyer_requests").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const adminListPropertySubmissions = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => ({ token: tok(d) }))
  .handler(async ({ data }) => {
    await verify(data.token);
    const db = await admin();
    const { data: rows, error } = await db.from("property_submissions").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return await Promise.all((rows ?? []).map(async (row: any) => {
      const mediaPaths = Array.isArray(row.media_paths) ? row.media_paths : [];
      const media = await Promise.all(mediaPaths.map(async (path: string) => {
        const { data: signed } = await db.storage.from("property-submissions").createSignedUrl(path, 300);
        return { path, url: signed?.signedUrl ?? null };
      }));
      let contractUrl: string | null = null;
      if (row.contract_document_path) {
        const { data: signed } = await db.storage.from("property-submissions").createSignedUrl(row.contract_document_path, 300);
        contractUrl = signed?.signedUrl ?? null;
      }
      return { ...row, media, contractUrl };
    }));
  });

export const adminReviewPropertySubmission = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; id: string; decision: "approved" | "rejected" | "changes_requested"; notes?: string; verifyContractRights?: boolean }) => ({
    token: tok(d), id: String(d.id), decision: d.decision,
    notes: String(d.notes ?? "").slice(0, 4000), verifyContractRights: !!d.verifyContractRights,
  }))
  .handler(async ({ data }) => {
    await verify(data.token);
    if (!["approved", "rejected", "changes_requested"].includes(data.decision)) throw new Error("Invalid review decision");
    const db = await admin();
    const { data: row, error: readError } = await db.from("property_submissions").select("*").eq("id", data.id).single();
    if (readError || !row) throw new Error("Submission not found");
    if (row.review_status !== "pending" && row.review_status !== "changes_requested") throw new Error("This submission has already been reviewed");
    let propertyId: string | null = null;
    if (data.decision === "approved") {
      if (row.has_contract_rights && !data.verifyContractRights) {
        throw new Error("Confirm assignment eligibility, seller authority and required written disclosures before publishing contract rights.");
      }
      const propertyPayload = {
        slug: String(row.slug), title: row.title, location: row.location, city: row.city,
        status: row.listing_status, property_type: row.property_type,
        price: row.has_contract_rights ? row.contract_price : row.asking_price,
        bedrooms: row.bedrooms, bathrooms: row.bathrooms, sqft: row.sqft, lot_size: row.lot_size,
        description: row.description, neighborhood: row.neighborhood, address: row.address,
        is_published: true, opportunity_type: row.has_contract_rights ? "contract_assignment" : "direct_purchase",
        contract_rights_verified: !!row.has_contract_rights, written_disclosures_verified: !!row.has_contract_rights,
        opportunity_summary: row.has_contract_rights ? "Contract assignment opportunity. Contact Liberty Crest Realty for transaction details." : null,
        seller_or_contract_holder_label: row.has_contract_rights ? "Contract holder" : "Property seller",
      };
      const { data: property, error: propertyError } = await db.from("properties").insert(propertyPayload).select("id").single();
      if (propertyError || !property) throw new Error(propertyError?.message ?? "Could not publish property");
      propertyId = property.id;
      const paths: string[] = Array.isArray(row.media_paths) ? row.media_paths : [];
      const copiedPaths: string[] = [];
      try {
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const { data: blob, error: downloadError } = await db.storage.from("property-submissions").download(path);
          if (downloadError || !blob) throw new Error("A submission photo or video could not be copied, so approval was cancelled.");
          const filename = path.split("/").pop() ?? `media-${i}`;
          const publicPath = `${propertyId}/${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const { error: uploadError } = await db.storage.from("property-media").upload(publicPath, blob, { upsert: false });
          if (uploadError) throw new Error("A submission photo or video could not be copied, so approval was cancelled.");
          copiedPaths.push(publicPath);
          const url = db.storage.from("property-media").getPublicUrl(publicPath).data.publicUrl;
          const { error: mediaError } = await db.from("property_media").insert({
            property_id: propertyId, media_type: /\\.(mp4|mov|webm)$/i.test(filename) ? "video" : "image",
            storage_path: publicPath, url, caption: filename, sort_order: i,
          });
          if (mediaError) throw new Error("A submission photo or video could not be linked, so approval was cancelled.");
        }
      } catch (mediaFailure) {
        if (copiedPaths.length) await db.storage.from("property-media").remove(copiedPaths);
        await db.from("properties").delete().eq("id", propertyId);
        throw mediaFailure;
      }
    }
    const { error: updateError } = await db.from("property_submissions").update({
      review_status: data.decision, admin_notes: data.notes, reviewed_at: new Date().toISOString(), created_property_id: propertyId,
    }).eq("id", data.id);
    if (updateError) throw new Error(updateError.message);
    return { ok: true, propertyId };
  });
