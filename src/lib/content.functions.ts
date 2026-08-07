import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DonationInput, DonationRow } from "./content-types";

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchHome } = await import("./content.server");
  return fetchHome();
});

export const getCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchCampaigns } = await import("./content.server");
  return fetchCampaigns();
});

export const getCampaignDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { fetchCampaignDetail } = await import("./content.server");
    return fetchCampaignDetail(data.slug);
  });

export const getStories = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchStories } = await import("./content.server");
  return fetchStories();
});

export const getStory = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { fetchStory } = await import("./content.server");
    return fetchStory(data.slug);
  });

export const getMapData = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchMapData } = await import("./content.server");
  return fetchMapData();
});

export const getTransparency = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchTransparency } = await import("./content.server");
  return fetchTransparency();
});

export const startDonation = createServerFn({ method: "POST" })
  .inputValidator((data: DonationInput) => {
    const amountCents = Math.round(Number(data.amountCents));
    if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 100_000_00) {
      throw new Error("INVALID_AMOUNT");
    }
    const email = String(data.donorEmail ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      throw new Error("INVALID_EMAIL");
    }
    const name = String(data.donorName ?? "").trim().slice(0, 120);
    if (name.length < 2) throw new Error("INVALID_NAME");

    return {
      amountCents,
      frequency: data.frequency === "monthly" ? ("monthly" as const) : ("one_time" as const),
      campaignSlug: data.campaignSlug ? String(data.campaignSlug).slice(0, 120) : null,
      donorEmail: email,
      donorName: name,
      isAnonymous: Boolean(data.isAnonymous),
      dedication: data.dedication ? String(data.dedication).slice(0, 500) : null,
    } satisfies DonationInput;
  })
  .handler(async ({ data }) => {
    const { recordPendingDonation } = await import("./content.server");
    return recordPendingDonation(data);
  });

export const getMyDonations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DonationRow[]> => {
    const { data, error } = await context.supabase
      .from("donations")
      .select(
        "id, amount_cents, frequency, status, created_at, liters_funded, dedication, campaign_id, campaigns:campaign_id ( slug, name_en, name_es )",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
      const campaign = row["campaigns"] as Record<string, unknown> | null;
      return {
        id: String(row["id"]),
        amount_cents: Number(row["amount_cents"]),
        frequency: String(row["frequency"]),
        status: String(row["status"]),
        created_at: String(row["created_at"]),
        liters_funded: Number(row["liters_funded"]),
        dedication: row["dedication"] ? String(row["dedication"]) : null,
        campaign_id: row["campaign_id"] ? String(row["campaign_id"]) : null,
        campaign_slug: campaign ? String(campaign["slug"]) : null,
        campaign_name_en: campaign ? String(campaign["name_en"]) : null,
        campaign_name_es: campaign ? String(campaign["name_es"]) : null,
      };
    });
  });
