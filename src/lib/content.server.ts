import { createPublicServerClient } from "./supabase-public.server";
import type {
  CampaignRow,
  CommunityRow,
  CrisisStats,
  DeliveryRow,
  DonationInput,
  MediaRow,
  PartnerRow,
  ReportRow,
  StoryRow,
  UpdateRow,
} from "./content-types";

const CAMPAIGN_SELECT = `
  id, slug, name_en, name_es, need_en, need_es, summary_en, summary_es, story_en, story_es,
  goal_cents, seed_raised_cents, beneficiaries, liters_per_usd, status, urgency, is_featured, created_at,
  communities:community_id ( id, slug, name, region_en, region_es, drought_level )
`;

type RawCampaign = Record<string, unknown> & {
  communities?: Record<string, unknown> | null;
};

type Totals = Record<string, { raised: number; donors: number }>;

async function loadTotals(): Promise<Totals> {
  const supabase = createPublicServerClient();
  const { data } = await supabase.rpc("get_campaign_totals");
  const totals: Totals = {};
  for (const row of (data ?? []) as Array<{
    campaign_id: string;
    raised_cents: number;
    donor_count: number;
  }>) {
    totals[row.campaign_id] = { raised: Number(row.raised_cents), donors: Number(row.donor_count) };
  }
  return totals;
}

function shapeCampaign(raw: RawCampaign, totals: Totals): CampaignRow {
  const id = String(raw["id"]);
  const total = totals[id];
  const community = raw.communities
    ? {
        id: String(raw.communities["id"]),
        slug: String(raw.communities["slug"]),
        name: String(raw.communities["name"]),
        region_en: String(raw.communities["region_en"]),
        region_es: String(raw.communities["region_es"]),
        drought_level: Number(raw.communities["drought_level"]),
      }
    : null;

  return {
    id,
    slug: String(raw["slug"]),
    name_en: String(raw["name_en"]),
    name_es: String(raw["name_es"]),
    need_en: String(raw["need_en"]),
    need_es: String(raw["need_es"]),
    summary_en: String(raw["summary_en"]),
    summary_es: String(raw["summary_es"]),
    story_en: String(raw["story_en"]),
    story_es: String(raw["story_es"]),
    goal_cents: Number(raw["goal_cents"]),
    beneficiaries: Number(raw["beneficiaries"]),
    liters_per_usd: Number(raw["liters_per_usd"]),
    status: String(raw["status"]),
    urgency: String(raw["urgency"]),
    raised_cents: total ? total.raised : Number(raw["seed_raised_cents"] ?? 0),
    donor_count: total ? total.donors : 0,
    community,
  };
}

export async function fetchStats(): Promise<CrisisStats> {
  const supabase = createPublicServerClient();
  const { data } = await supabase.rpc("get_crisis_stats");
  const stats = (data ?? {}) as Record<string, number>;
  return {
    funds_raised_cents: Number(stats["funds_raised_cents"] ?? 0),
    families_supported: Number(stats["families_supported"] ?? 0),
    liters_delivered: Number(stats["liters_delivered"] ?? 0),
    communities_reached: Number(stats["communities_reached"] ?? 0),
    active_campaigns: Number(stats["active_campaigns"] ?? 0),
    donor_count: Number(stats["donor_count"] ?? 0),
    max_drought_level: Number(stats["max_drought_level"] ?? 0),
    avg_drought_level: Number(stats["avg_drought_level"] ?? 0),
  };
}

export async function fetchCampaigns(options?: { featuredOnly?: boolean }): Promise<CampaignRow[]> {
  const supabase = createPublicServerClient();
  let query = supabase.from("campaigns").select(CAMPAIGN_SELECT).order("created_at", { ascending: true });
  if (options?.featuredOnly) query = query.eq("is_featured", true);
  const [{ data, error }, totals] = await Promise.all([query, loadTotals()]);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawCampaign[]).map((row) => shapeCampaign(row, totals));
}

export async function fetchCommunities(): Promise<CommunityRow[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("communities")
    .select("id, slug, name, region_en, region_es, latitude, longitude, drought_level, population, families_served, liters_delivered")
    .order("drought_level", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CommunityRow[];
}

export async function fetchDeliveries(limit = 20): Promise<DeliveryRow[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select("id, kind, liters, families, note_en, note_es, delivered_at, communities:community_id ( name, slug )")
    .order("delivered_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const community = row["communities"] as Record<string, unknown> | null;
    return {
      id: String(row["id"]),
      kind: String(row["kind"]),
      liters: Number(row["liters"]),
      families: Number(row["families"]),
      note_en: String(row["note_en"]),
      note_es: String(row["note_es"]),
      delivered_at: String(row["delivered_at"]),
      community_name: community ? String(community["name"]) : null,
      community_slug: community ? String(community["slug"]) : null,
    };
  });
}

function shapeStory(row: Record<string, unknown>): StoryRow {
  const campaign = row["campaigns"] as Record<string, unknown> | null;
  const community = row["communities"] as Record<string, unknown> | null;
  return {
    id: String(row["id"]),
    slug: String(row["slug"]),
    title_en: String(row["title_en"]),
    title_es: String(row["title_es"]),
    quote_en: String(row["quote_en"]),
    quote_es: String(row["quote_es"]),
    body_en: String(row["body_en"]),
    body_es: String(row["body_es"]),
    author_name: String(row["author_name"]),
    author_role_en: String(row["author_role_en"]),
    author_role_es: String(row["author_role_es"]),
    video_url: row["video_url"] ? String(row["video_url"]) : null,
    published_at: String(row["published_at"]),
    campaign_id: row["campaign_id"] ? String(row["campaign_id"]) : null,
    campaign_slug: campaign ? String(campaign["slug"]) : null,
    campaign_name_en: campaign ? String(campaign["name_en"]) : null,
    campaign_name_es: campaign ? String(campaign["name_es"]) : null,
    community_name: community ? String(community["name"]) : null,
  };
}

const STORY_SELECT = `
  id, slug, title_en, title_es, quote_en, quote_es, body_en, body_es,
  author_name, author_role_en, author_role_es, video_url, published_at, campaign_id,
  campaigns:campaign_id ( slug, name_en, name_es ),
  communities:community_id ( name )
`;

export async function fetchStories(limit = 20): Promise<StoryRow[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Array<Record<string, unknown>>).map(shapeStory);
}

export async function fetchStory(slug: string) {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase.from("stories").select(STORY_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return shapeStory(data as Record<string, unknown>);
}

export async function fetchCampaignDetail(slug: string) {
  const supabase = createPublicServerClient();
  const [{ data, error }, totals] = await Promise.all([
    supabase.from("campaigns").select(CAMPAIGN_SELECT).eq("slug", slug).maybeSingle(),
    loadTotals(),
  ]);
  if (error) throw new Error(error.message);
  if (!data) return null;

  const campaign = shapeCampaign(data as RawCampaign, totals);

  const [updatesRes, mediaRes, storiesRes, deliveriesRes] = await Promise.all([
    supabase
      .from("campaign_updates")
      .select("id, title_en, title_es, body_en, body_es, published_at, campaign_id")
      .eq("campaign_id", campaign.id)
      .order("published_at", { ascending: false }),
    supabase
      .from("campaign_media")
      .select("id, media_type, url, caption_en, caption_es")
      .eq("campaign_id", campaign.id)
      .order("sort_order", { ascending: true }),
    supabase.from("stories").select(STORY_SELECT).eq("campaign_id", campaign.id).order("published_at", { ascending: false }),
    supabase
      .from("deliveries")
      .select("id, kind, liters, families, note_en, note_es, delivered_at, communities:community_id ( name, slug )")
      .eq("campaign_id", campaign.id)
      .order("delivered_at", { ascending: false })
      .limit(10),
  ]);

  return {
    campaign,
    updates: (updatesRes.data ?? []) as UpdateRow[],
    media: (mediaRes.data ?? []) as MediaRow[],
    stories: ((storiesRes.data ?? []) as Array<Record<string, unknown>>).map(shapeStory),
    deliveries: ((deliveriesRes.data ?? []) as Array<Record<string, unknown>>).map((row) => {
      const community = row["communities"] as Record<string, unknown> | null;
      return {
        id: String(row["id"]),
        kind: String(row["kind"]),
        liters: Number(row["liters"]),
        families: Number(row["families"]),
        note_en: String(row["note_en"]),
        note_es: String(row["note_es"]),
        delivered_at: String(row["delivered_at"]),
        community_name: community ? String(community["name"]) : null,
        community_slug: community ? String(community["slug"]) : null,
      } satisfies DeliveryRow;
    }),
  };
}

export async function fetchTransparency() {
  const supabase = createPublicServerClient();
  const [reportsRes, partnersRes, stats, deliveries] = await Promise.all([
    supabase
      .from("financial_reports")
      .select(
        "id, period, total_raised_cents, program_cents, admin_cents, processing_cents, liters_delivered, families_served, notes_en, notes_es",
      )
      .order("period", { ascending: false }),
    supabase.from("partners").select("id, name, role_en, role_es, website").order("sort_order", { ascending: true }),
    fetchStats(),
    fetchDeliveries(25),
  ]);

  return {
    reports: (reportsRes.data ?? []) as ReportRow[],
    partners: (partnersRes.data ?? []) as PartnerRow[],
    stats,
    deliveries,
  };
}

export async function fetchHome() {
  const [stats, campaigns, stories, communities, deliveries] = await Promise.all([
    fetchStats(),
    fetchCampaigns({ featuredOnly: true }),
    fetchStories(3),
    fetchCommunities(),
    fetchDeliveries(5),
  ]);
  return { stats, campaigns, stories, communities, deliveries };
}

export async function fetchMapData() {
  const [communities, campaigns, deliveries] = await Promise.all([
    fetchCommunities(),
    fetchCampaigns(),
    fetchDeliveries(30),
  ]);
  return { communities, campaigns, deliveries };
}

/**
 * Records a pending donation intent. Money is only ever marked as received by a
 * verified payment-provider webhook, never here and never from the browser.
 */
export async function recordPendingDonation(input: DonationInput) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let campaignId: string | null = null;
  let litersPerUsd = 40;
  if (input.campaignSlug) {
    const { data } = await supabaseAdmin
      .from("campaigns")
      .select("id, liters_per_usd")
      .eq("slug", input.campaignSlug)
      .maybeSingle();
    if (data) {
      campaignId = data.id;
      litersPerUsd = Number(data.liters_per_usd);
    }
  }

  const litersFunded = Math.round((input.amountCents / 100) * litersPerUsd);

  const { data, error } = await supabaseAdmin
    .from("donations")
    .insert({
      campaign_id: campaignId,
      amount_cents: input.amountCents,
      frequency: input.frequency,
      status: "pending",
      donor_email: input.donorEmail.toLowerCase(),
      donor_name: input.donorName,
      is_anonymous: input.isAnonymous,
      dedication: input.dedication,
      liters_funded: litersFunded,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const checkoutConfigured = Boolean(process.env["STRIPE_SECRET_KEY"]);

  return {
    donationId: data.id,
    litersFunded,
    checkoutConfigured,
    checkoutUrl: null as string | null,
  };
}
