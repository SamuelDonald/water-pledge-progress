import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Droplets, Users } from "lucide-react";
import { campaignQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, formatNumber, progressPercent } from "@/lib/format";
import { campaignImage, storyImage } from "@/lib/media";
import { DroughtBadge, ProgressBar, StatTile } from "@/components/primitives";

export const Route = createFileRoute("/campaigns/$slug")({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(campaignQuery(params.slug));
    if (!detail) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `Campaign: ${params.slug.replace(/-/g, " ")} — Water for Puerto Rico` },
      {
        name: "description",
        content:
          "Follow this water relief campaign: funding progress, delivery log, field updates and community stories.",
      },
      { property: "og:title", content: "Water relief campaign — Water for Puerto Rico" },
      {
        property: "og:description",
        content: "Funding progress, delivery log and field updates for this community campaign.",
      },
    ],
  }),
  component: CampaignDetail,
  notFoundComponent: CampaignMissing,
});

function CampaignMissing() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
      <h1 className="text-display text-3xl">{t("campaigns.notFound")}</h1>
      <Link to="/campaigns" className="mt-6 inline-block text-sm font-semibold text-ocean hover:underline">
        {t("campaigns.viewAll")}
      </Link>
    </div>
  );
}

function CampaignDetail() {
  const { slug } = Route.useParams();
  const { t, lang, pick } = useI18n();
  const { data } = useSuspenseQuery(campaignQuery(slug));

  if (!data) return <CampaignMissing />;

  const { campaign, updates, stories, deliveries } = data;
  const percent = progressPercent(campaign.raised_cents, campaign.goal_cents);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:py-14">
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("campaigns.viewAll")}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <img
            src={campaignImage(campaign.slug)}
            alt={pick(campaign, "name")}
            className="aspect-[16/9] w-full rounded-xl object-cover"
          />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-coral px-3 py-1 text-xs font-semibold text-coral-foreground">
              {t(`campaigns.urgency.${campaign.urgency}`)}
            </span>
            {campaign.community ? <DroughtBadge level={campaign.community.drought_level} /> : null}
            {campaign.community ? (
              <span className="text-eyebrow text-muted-foreground">
                {campaign.community.name} · {pick(campaign.community, "region")}
              </span>
            ) : null}
          </div>

          <h1 className="text-display mt-4 text-3xl leading-tight sm:text-5xl">{pick(campaign, "name")}</h1>
          <p className="mt-4 text-base text-muted-foreground">{pick(campaign, "summary")}</p>

          <div className="mt-8 rounded-xl border border-border bg-sand/40 p-5">
            <h2 className="text-eyebrow text-ocean">{t("campaigns.need")}</h2>
            <p className="mt-2 text-sm">{pick(campaign, "need")}</p>
          </div>

          <div className="mt-8 space-y-4 text-base leading-relaxed">
            {pick(campaign, "story")
              .split("\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>

          <section className="mt-12">
            <h2 className="text-display text-2xl">{t("campaigns.updates")}</h2>
            {updates.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("campaigns.noUpdates")}</p>
            ) : (
              <ol className="mt-5 space-y-5 border-l border-border pl-5">
                {updates.map((update) => (
                  <li key={update.id} className="relative">
                    <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-ocean" />
                    <p className="text-eyebrow text-muted-foreground">
                      {formatDate(update.published_at, lang)}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{pick(update, "title")}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{pick(update, "body")}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {deliveries.length > 0 && (
            <section className="mt-12">
              <h2 className="text-display text-2xl">{t("transparency.deliveryLog")}</h2>
              <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-sand/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">{t("transparency.date")}</th>
                      <th className="px-4 py-3 font-medium">{t("transparency.type")}</th>
                      <th className="px-4 py-3 text-right font-medium">{t("transparency.liters")}</th>
                      <th className="px-4 py-3 text-right font-medium">{t("transparency.familiesCol")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-t border-border/70">
                        <td className="px-4 py-3">{formatDate(delivery.delivered_at, lang)}</td>
                        <td className="px-4 py-3">{t(`kind.${delivery.kind}`)}</td>
                        <td className="tabular px-4 py-3 text-right">
                          {formatNumber(delivery.liters, lang)}
                        </td>
                        <td className="tabular px-4 py-3 text-right">
                          {formatNumber(delivery.families, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {stories.length > 0 && (
            <section className="mt-12">
              <h2 className="text-display text-2xl">{t("campaigns.relatedStories")}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {stories.map((story) => (
                  <Link
                    key={story.id}
                    to="/stories/$slug"
                    params={{ slug: story.slug }}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <img
                      src={storyImage(story.slug)}
                      alt={pick(story, "title")}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-display text-lg leading-snug">{pick(story, "title")}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{story.author_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="tabular text-display text-3xl">{formatCurrency(campaign.raised_cents, lang)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("campaigns.of")} {formatCurrency(campaign.goal_cents, lang)} {t("campaigns.goal")}
            </p>
            <div className="mt-4">
              <ProgressBar percent={percent} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span className="tabular">{percent}%</span>
              <span className="tabular">
                {formatNumber(campaign.donor_count, lang)} {t("campaigns.donors")}
              </span>
            </div>

            <Link
              to="/donate"
              search={{ campaign: campaign.slug }}
              className="mt-5 block rounded-full bg-coral px-5 py-3 text-center text-sm font-semibold text-coral-foreground transition-opacity hover:opacity-90"
            >
              {t("campaigns.support")}
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">{t("donate.methods")}</p>
          </div>

          <div className="mt-4 grid gap-4">
            <StatTile
              label={t("campaigns.beneficiaries")}
              value={formatNumber(campaign.beneficiaries, lang)}
              icon={<Users className="size-4" />}
            />
            <StatTile
              label={t("donate.litersFunded")}
              value={`${formatNumber(campaign.liters_per_usd, lang)} L / $1`}
              icon={<Droplets className="size-4" />}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
