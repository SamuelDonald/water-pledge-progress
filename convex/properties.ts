import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const publicPropertyFields = {
  id: v.string(),
  slug: v.string(),
  title: v.string(),
  location: v.string(),
  city: v.string(),
  status: v.string(),
  property_type: v.string(),
  opportunity_type: v.string(),
  price: v.number(),
  bedrooms: v.number(),
  bathrooms: v.number(),
  sqft: v.number(),
  lot_size: v.union(v.number(), v.null()),
  description: v.string(),
  neighborhood: v.union(v.string(), v.null()),
  address: v.union(v.string(), v.null()),
  opportunity_summary: v.union(v.string(), v.null()),
  latitude: v.union(v.number(), v.null()),
  longitude: v.union(v.number(), v.null()),
  is_featured: v.boolean(),
  created_at: v.number(),
  media: v.array(v.object({
    id: v.string(),
    media_type: v.union(v.literal("image"), v.literal("video")),
    url: v.string(),
    caption: v.union(v.string(), v.null()),
    sort_order: v.number(),
  })),
};

async function publicRecord(ctx: QueryCtx, property: Doc<"properties">) {
  const media = await ctx.db
    .query("propertyMedia")
    .withIndex("by_property_order", (q) => q.eq("property_id", property._id))
    .collect();

  return {
    id: property._id,
    slug: property.slug,
    title: property.title,
    location: property.location,
    city: property.city,
    status: property.status,
    property_type: property.property_type,
    opportunity_type: property.opportunity_type,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    lot_size: property.lot_size,
    description: property.description,
    neighborhood: property.neighborhood,
    // Exact street addresses stay restricted until investor access is implemented.
    address: null,
    opportunity_summary: property.opportunity_summary ?? null,
    latitude: property.latitude,
    longitude: property.longitude,
    is_featured: property.is_featured,
    created_at: property.created_at,
    media: media
      .filter((item) => item.is_public)
      .map((item) => ({
        id: item._id,
        media_type: item.media_type,
        url: item.url,
        caption: item.caption,
        sort_order: item.sort_order,
      })),
  };
}

export const listPublished = query({
  args: {},
  returns: v.array(v.object(publicPropertyFields)),
  handler: async (ctx) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_published_created", (q) => q.eq("is_published", true))
      .order("desc")
      .collect();

    const publicProperties = properties.filter(
      (property) =>
        property.review_status === "published" &&
        property.is_published &&
        (property.opportunity_type !== "contract_assignment" ||
          (property.contract_rights_verified && property.written_disclosures_verified)),
    );

    const records = await Promise.all(publicProperties.map((property) => publicRecord(ctx, property)));
    return records.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  },
});

export const getPublishedBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.object(publicPropertyFields), v.null()),
  handler: async (ctx, { slug }) => {
    const property = await ctx.db
      .query("properties")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (
      !property ||
      !property.is_published ||
      property.review_status !== "published" ||
      (property.opportunity_type === "contract_assignment" &&
        (!property.contract_rights_verified || !property.written_disclosures_verified))
    ) {
      return null;
    }

    return publicRecord(ctx, property);
  },
});
