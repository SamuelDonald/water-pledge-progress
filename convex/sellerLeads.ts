import { mutation } from "./_generated/server";
import { v } from "convex/values";

const location = v.union(
  v.literal("Dallas"),
  v.literal("Houston"),
  v.literal("Rio Grande Valley"),
);

const propertyType = v.union(
  v.literal("House"),
  v.literal("Condo"),
  v.literal("Apartment"),
  v.literal("Multi-family"),
  v.literal("Land"),
  v.literal("Commercial"),
  v.literal("Mixed-use"),
  v.literal("Other"),
);

export const submit = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    city: v.string(),
    location,
    property_type: v.optional(propertyType),
    address: v.optional(v.string()),
    asking_price: v.optional(v.number()),
    description: v.string(),
    existing_contract: v.boolean(),
    contract_rights_confirmed: v.boolean(),
    disclosures_acknowledged: v.boolean(),
    contact_permission: v.object({
      phone: v.boolean(),
      sms: v.boolean(),
      whatsapp: v.boolean(),
    }),
  },
  returns: v.object({ ok: v.boolean(), leadId: v.id("sellerLeads") }),
  handler: async (ctx, args) => {
    const name = args.name.trim().slice(0, 120);
    const phone = args.phone.trim().slice(0, 40);
    const email = args.email.trim().toLowerCase().slice(0, 254);
    const city = args.city.trim().slice(0, 120);
    const description = args.description.trim().slice(0, 4000);
    const address = args.address?.trim().slice(0, 300);

    if (name.length < 2 || phone.length < 7 || !email.includes("@") || city.length < 2 || description.length < 10) {
      throw new Error("Please provide valid contact details and a property description.");
    }
    if (args.asking_price !== undefined && (!Number.isFinite(args.asking_price) || args.asking_price < 0)) {
      throw new Error("Asking price must be a non-negative number.");
    }
    if (args.existing_contract && !args.disclosures_acknowledged) {
      throw new Error("Please acknowledge the contract and disclosure requirements.");
    }

    const now = Date.now();
    const leadId = await ctx.db.insert("sellerLeads", {
      name,
      phone,
      email,
      city,
      location: args.location,
      property_type: args.property_type,
      address: address || undefined,
      asking_price: args.asking_price,
      description,
      existing_contract: args.existing_contract,
      contract_rights_confirmed: args.contract_rights_confirmed,
      disclosures_acknowledged: args.disclosures_acknowledged,
      contact_permission: args.contact_permission,
      status: "submitted",
      created_at: now,
      updated_at: now,
    });

    await ctx.db.insert("auditLogs", {
      actorLabel: "Public seller intake",
      action: "seller_lead.submitted",
      entityType: "sellerLead",
      entityId: leadId,
      summary: "A seller submitted a property lead for review.",
      createdAt: now,
    });

    return { ok: true, leadId };
  },
});
