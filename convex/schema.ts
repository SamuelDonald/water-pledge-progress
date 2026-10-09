import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const location = v.union(
  v.literal("Dallas"),
  v.literal("Houston"),
  v.literal("Rio Grande Valley"),
);
const propertyStatus = v.union(
  v.literal("For Sale"),
  v.literal("For Rent"),
  v.literal("Sold"),
  v.literal("Rented"),
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
const opportunityType = v.union(
  v.literal("contract_assignment"),
  v.literal("direct_purchase"),
  v.literal("seller_introduction"),
);
const reviewStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("changes_requested"),
  v.literal("approved"),
  v.literal("published"),
  v.literal("rejected"),
  v.literal("archived"),
);
const mediaType = v.union(v.literal("image"), v.literal("video"));
const workflowStatus = v.union(
  v.literal("submitted"),
  v.literal("under_review"),
  v.literal("needs_information"),
  v.literal("approved"),
  v.literal("declined"),
  v.literal("withdrawn"),
  v.literal("completed"),
);
const role = v.union(
  v.literal("investor"),
  v.literal("seller"),
  v.literal("admin"),
);

export default defineSchema({
  ...authTables,

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role,
    investorVerificationStatus: v.union(
      v.literal("not_started"),
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  properties: defineTable({
    slug: v.string(),
    title: v.string(),
    location,
    city: v.string(),
    status: propertyStatus,
    property_type: propertyType,
    opportunity_type: opportunityType,
    contract_rights_verified: v.boolean(),
    written_disclosures_verified: v.boolean(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    sqft: v.number(),
    lot_size: v.union(v.number(), v.null()),
    description: v.string(),
    neighborhood: v.union(v.string(), v.null()),
    address: v.union(v.string(), v.null()),
    seller_or_contract_holder_label: v.optional(v.union(v.string(), v.null())),
    opportunity_summary: v.optional(v.union(v.string(), v.null())),
    latitude: v.union(v.number(), v.null()),
    longitude: v.union(v.number(), v.null()),
    is_featured: v.boolean(),
    is_published: v.boolean(),
    review_status: v.optional(reviewStatus),
    source_type: v.union(
      v.literal("navalhomes"),
      v.literal("third_party"),
      v.literal("seller_submission"),
    ),
    created_by: v.optional(v.id("users")),
    created_at: v.number(),
    updated_at: v.number(),
    published_at: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_published_created", ["is_published", "created_at"])
    .index("by_location_published", ["location", "is_published"])
    .index("by_review_status", ["review_status"])
    .index("by_source_type", ["source_type"]),

  propertyMedia: defineTable({
    property_id: v.id("properties"),
    media_type: mediaType,
    url: v.string(),
    caption: v.union(v.string(), v.null()),
    sort_order: v.number(),
    is_public: v.boolean(),
    created_at: v.number(),
  }).index("by_property_order", ["property_id", "sort_order"]),

  sellerLeads: defineTable({
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
    status: workflowStatus,
    review_notes: v.optional(v.string()),
    linked_property_id: v.optional(v.id("properties")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_status_created", ["status", "created_at"])
    .index("by_email", ["email"]),

  savedDeals: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
    createdAt: v.number(),
  })
    .index("by_user_property", ["userId", "propertyId"])
    .index("by_user", ["userId"]),

  documentRequests: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
    requestedDocuments: v.array(v.string()),
    message: v.optional(v.string()),
    status: workflowStatus,
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_property_status", ["propertyId", "status"]),

  offers: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
    amount: v.number(),
    terms: v.optional(v.string()),
    status: workflowStatus,
    acknowledgementVersion: v.string(),
    acknowledgedAt: v.number(),
    decisionBy: v.optional(v.id("users")),
    decisionAt: v.optional(v.number()),
    decisionNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_property_status", ["propertyId", "status"]),

  milestones: defineTable({
    propertyId: v.id("properties"),
    offerId: v.optional(v.id("offers")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("complete"),
      v.literal("blocked"),
    ),
    dueAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_property", ["propertyId"])
    .index("by_offer", ["offerId"]),

  auditLogs: defineTable({
    actorUserId: v.optional(v.id("users")),
    actorLabel: v.optional(v.string()),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    summary: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_actor_created", ["actorUserId", "createdAt"]),
});
