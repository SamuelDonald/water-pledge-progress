export type CrisisStats = {
  funds_raised_cents: number;
  families_supported: number;
  liters_delivered: number;
  communities_reached: number;
  active_campaigns: number;
  donor_count: number;
  max_drought_level: number;
  avg_drought_level: number;
};

export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  region_en: string;
  region_es: string;
  latitude: number;
  longitude: number;
  drought_level: number;
  population: number;
  families_served: number;
  liters_delivered: number;
};

export type CampaignRow = {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  need_en: string;
  need_es: string;
  summary_en: string;
  summary_es: string;
  story_en: string;
  story_es: string;
  goal_cents: number;
  beneficiaries: number;
  liters_per_usd: number;
  status: string;
  urgency: string;
  raised_cents: number;
  donor_count: number;
  community: Pick<CommunityRow, "id" | "slug" | "name" | "region_en" | "region_es" | "drought_level"> | null;
};

export type UpdateRow = {
  id: string;
  title_en: string;
  title_es: string;
  body_en: string;
  body_es: string;
  published_at: string;
  campaign_id: string;
};

export type MediaRow = {
  id: string;
  media_type: string;
  url: string;
  caption_en: string;
  caption_es: string;
};

export type StoryRow = {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  quote_en: string;
  quote_es: string;
  body_en: string;
  body_es: string;
  author_name: string;
  author_role_en: string;
  author_role_es: string;
  video_url: string | null;
  published_at: string;
  campaign_id: string | null;
  campaign_slug: string | null;
  campaign_name_en: string | null;
  campaign_name_es: string | null;
  community_name: string | null;
};

export type DeliveryRow = {
  id: string;
  kind: string;
  liters: number;
  families: number;
  note_en: string;
  note_es: string;
  delivered_at: string;
  community_name: string | null;
  community_slug: string | null;
};

export type PartnerRow = {
  id: string;
  name: string;
  role_en: string;
  role_es: string;
  website: string | null;
};

export type ReportRow = {
  id: string;
  period: string;
  total_raised_cents: number;
  program_cents: number;
  admin_cents: number;
  processing_cents: number;
  liters_delivered: number;
  families_served: number;
  notes_en: string;
  notes_es: string;
};

export type DonationRow = {
  id: string;
  amount_cents: number;
  frequency: string;
  status: string;
  created_at: string;
  liters_funded: number;
  dedication: string | null;
  campaign_id: string | null;
  campaign_slug: string | null;
  campaign_name_en: string | null;
  campaign_name_es: string | null;
};

export type DonationInput = {
  amountCents: number;
  frequency: "one_time" | "monthly";
  campaignSlug: string | null;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  dedication: string | null;
};
