import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { mapQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/format";
import { DroughtBadge, droughtColorVar } from "@/components/primitives";

export const Route = createFileRoute("/map")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(mapQuery);
  },
  head: () => ({
    meta: [
      { title: "Emergency map — drought severity across Puerto Rico" },
      {
        name: "description",
        content:
          "Drought severity by municipality, communities receiving aid, active campaigns and logged distribution points.",
      },
      { property: "og:title", content: "Emergency map — drought severity across Puerto Rico" },
      { property: "og:description", content: "Drought severity, aid coverage and distribution points." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { t, lang, pick } = useI18n();
  const { data } = useSuspenseQuery(mapQuery);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("map.title")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("map.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("map.subtitle")}</p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <span className="text-eyebrow text-muted-foreground">{t("map.legend")}</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <DroughtBadge key={level} level={level} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.communities.map((community) => {
          const campaign = data.campaigns.find((c) => c.community?.slug === community.slug);
          return (
            <article
              key={community.id}
              className="rounded-xl border border-border bg-card p-5"
              style={{ borderTop: `4px solid ${droughtColorVar(community.drought_level)}` }}
            >
              <h2 className="text-display text-xl">{community.name}</h2>
              <p className="text-eyebrow mt-1 text-muted-foreground">{pick(community, "region")}</p>
              <div className="mt-3">
                <DroughtBadge level={community.drought_level} />
              </div>
              <dl className="tabular mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{t("map.families")}</dt>
                  <dd className="font-semibold">{formatNumber(community.families_served, lang)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{t("dash.liters")}</dt>
                  <dd className="font-semibold">{formatNumber(community.liters_delivered, lang)} L</dd>
                </div>
              </dl>
              {campaign ? (
                <Link
                  to="/campaigns/$slug"
                  params={{ slug: campaign.slug }}
                  className="mt-4 inline-block text-sm font-semibold text-ocean hover:underline"
                >
                  {t("map.activeCampaign")}: {pick(campaign, "name")}
                </Link>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{t("map.noCampaign")}</p>
              )}
            </article>
          );
        })}
      </div>

      <section className="mt-14">
        <h2 className="text-display text-2xl">{t("map.deliveries")}</h2>
        <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card">
          {data.deliveries.map((delivery) => (
            <li key={delivery.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
              <span className="tabular w-28 text-muted-foreground">
                {formatDate(delivery.delivered_at, lang)}
              </span>
              <span className="font-medium">{delivery.community_name}</span>
              <span className="text-muted-foreground">{t(`kind.${delivery.kind}`)}</span>
              <span className="tabular ml-auto text-muted-foreground">
                {formatNumber(delivery.liters, lang)} L · {formatNumber(delivery.families, lang)}{" "}
                {t("map.families")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
