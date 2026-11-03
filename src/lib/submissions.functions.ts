import { createServerFn } from "@tanstack/react-start";

const LOCATIONS = ["Dallas", "Houston", "Rio Grande Valley"];
const TYPES = ["House", "Condo", "Apartment", "Multi-family", "Land", "Commercial", "Mixed-use", "Other"];
const s = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? x : 0; };

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

/** Issues a one-time signed upload slot in the private submissions bucket. */
export const createSubmissionUpload = createServerFn({ method: "POST" })
  .inputValidator((d: { filename: string; kind: "media" | "contract" }) => ({ filename: s(d.filename, 120), kind: d.kind === "contract" ? "contract" : "media" }))
  .handler(async ({ data }) => {
    const client = await db();
    const folder = data.kind === "contract" ? "contracts" : "pending";
    const path = `${folder}/${crypto.randomUUID()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { data: signed, error } = await client.storage.from("property-submissions").createSignedUploadUrl(path);
    if (error) throw new Error("Upload could not be prepared. Please try again.");
    return { path, token: signed.token as string };
  });

export type SubmissionInput = Record<string, unknown> & { mediaPaths: string[]; contractPath: string | null };

export const submitPropertySubmission = createServerFn({ method: "POST" })
  .inputValidator((d: SubmissionInput) => d)
  .handler(async ({ data: d }) => {
    const title = s(d.title, 180);
    const location = s(d.location, 40);
    const type = s(d.propertyType, 40);
    const email = s(d.sellerEmail, 254).toLowerCase();
    const phone = s(d.sellerPhone, 40);
    const contact = d.preferredContact === "phone" ? "phone" : d.preferredContact === "email" ? "email" : "";
    const rights = d.hasContractRights === true;
    const okPath = (p: unknown) => typeof p === "string" && /^(pending|contracts)\/[a-zA-Z0-9._-]+$/.test(p);
    const mediaPaths = (Array.isArray(d.mediaPaths) ? d.mediaPaths : []).filter((p) => okPath(p) && String(p).startsWith("pending/")).slice(0, 20);
    const contractPath = okPath(d.contractPath) && String(d.contractPath).startsWith("contracts/") ? String(d.contractPath) : null;
    if (title.length < 4 || !LOCATIONS.includes(location) || !TYPES.includes(type) || !s(d.city) || !s(d.description, 5000) ||
      s(d.sellerName, 120).length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, "").length < 7 ||
      !contact || d.authorized !== true) {
      throw new Error("Please complete all required fields, including how you'd like to be contacted.");
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + crypto.randomUUID().slice(0, 8);
    const client = await db();
    const { data: row, error } = await client.from("property_submissions").insert({
      title, slug, location, city: s(d.city, 120), property_type: type,
      listing_status: d.listingStatus === "For Rent" ? "For Rent" : "For Sale",
      asking_price: n(d.askingPrice), bedrooms: Math.round(n(d.bedrooms)), bathrooms: n(d.bathrooms),
      sqft: Math.round(n(d.sqft)), lot_size: d.lotSize ? n(d.lotSize) : null, description: s(d.description, 5000),
      neighborhood: s(d.neighborhood, 120) || null, address: s(d.address, 240) || null,
      seller_name: s(d.sellerName, 120), seller_phone: phone, seller_email: email, seller_role: s(d.sellerRole, 60) || "Owner",
      preferred_contact_method: contact, whatsapp_available: d.whatsappAvailable === true,
      media_paths: mediaPaths, has_contract_rights: rights,
      contract_type: rights ? s(d.contractType, 80) : null, contract_price: rights ? n(d.contractPrice) : null,
      contract_status: rights ? s(d.contractStatus, 80) : null, contract_notes: rights ? s(d.contractNotes, 2000) : null,
      contract_document_path: rights ? contractPath : null, authorization_confirmed: true, review_status: "pending",
    }).select("id").single();
    if (error) { console.error("submission_insert_failed", error.code, error.message); throw new Error("We couldn't save your submission. Please try again."); }
    return { ok: true, id: row.id as string, preferredContact: contact };
  });
