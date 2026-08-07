import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { campaignsQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { CampaignCard } from "@/components/campaign-card";

export const Route = createFileRoute("/campaigns/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(campaignsQuery);
  },
  head: () => ({
    meta: [
      { title: "Water campaigns across Puerto Rico — Water for Puerto Rico" },
      {
        name: "description",
        content:
          "Browse verified water relief campaigns by municipality: trucked water, school stations, household filters and community cisterns.",
      },
      { property: "og:title", content: "Water campaigns across Puerto Rico" },
      {
        property: "og:description",
        content: "Verified campaigns with published goals, deliveries and community updates.",
      },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { t } = useI18n();
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("nav.campaigns")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("campaigns.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("campaigns.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}
