import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { homeQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { heroImage, storyImage } from "@/lib/media";
import { formatDate, formatNumber } from "@/lib/format";
import { CampaignCard } from "@/components/campaign-card";
import { CrisisDashboard } from "@/components/crisis-dashboard";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeQuery);
  },
  head: () => ({
    meta: [
      { title: "Water for Puerto Rico — Fund clean water, follow every dollar" },
      {
        name: "description",
        content:
          "Puerto Rican communities are living through severe drought. Donate to verified water campaigns and track deliveries, liters and families reached.",
      },
      { property: "og:title", content: "Water for Puerto Rico — Fund clean water, follow every dollar" },
      {
        property: "og:description",
        content:
          "Donate to verified water campaigns across Puerto Rico and follow the deliveries your gift paid for.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang, pick } = useI18n();
  const { data } = useSuspenseQuery(homeQuery);

  return (
    <>
      <section className="relative overflow-hidden bg-ocean-deep text-sand">
        <img
          src={heroImage}
          alt={t("hero.caption")}
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-coral px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-coral-foreground" />
              {t("hero.eyebrow")}
            </span>
            <h1 className="text-display mt-6 text-4xl leading-[1.05] sm:text-6xl">{t("hero.title")}</h1>
            <p className="mt-5 max-w-xl text-base text-sand/85 sm:text-lg">{t("hero.body")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-coral-foreground transition-opacity hover:opacity-90"
              >
                {t("hero.donate")} <ArrowRight className="size-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-sand/40 px-6 py-3 text-sm font-semibold text-sand transition-colors hover:bg-sand/10"
              >
                {t("hero.impact")}
              </a>
            </div>
            <p className="mt-6 max-w-md text-xs text-sand/60">{t("hero.caption")}</p>
          </div>
        </div>
      </section>

      <CrisisDashboard stats={data.stats} communities={data.communities} />

      <section className="mx-auto w-full max-w-7xl px-5 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-coral">{t("nav.campaigns")}</p>
            <h2 className="text-display mt-3 text-3xl sm:text-4xl">{t("campaigns.title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("campaigns.subtitle")}</p>
          </div>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ocean hover:underline"
          >
            {t("campaigns.viewAll")} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:py-20">
        <div className="rounded-2xl border border-border bg-sand/50 p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-eyebrow text-ocean">{t("nav.transparency")}</p>
              <h2 className="text-display mt-3 text-2xl sm:text-3xl">{t("transparency.teaser")}</h2>
            </div>
            <Link
              to="/transparency"
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-ocean-foreground transition-opacity hover:opacity-90"
            >
              <ShieldCheck className="size-4" /> {t("nav.transparency")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-coral">{t("nav.stories")}</p>
            <h2 className="text-display mt-3 text-3xl sm:text-4xl">{t("stories.title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("stories.subtitle")}</p>
          </div>
          <Link to="/stories" className="text-sm font-semibold text-ocean hover:underline">
            {t("nav.stories")}
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {data.stories.map((story) => (
            <article key={story.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <Link to="/stories/$slug" params={{ slug: story.slug }}>
                <img
                  src={storyImage(story.slug)}
                  alt={pick(story, "title")}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </Link>
              <div className="p-5">
                <p className="text-eyebrow text-muted-foreground">
                  {story.community_name} · {formatDate(story.published_at, lang)}
                </p>
                <h3 className="text-display mt-2 text-lg leading-snug">
                  <Link to="/stories/$slug" params={{ slug: story.slug }} className="hover:text-ocean">
                    {pick(story, "title")}
                  </Link>
                </h3>
                <blockquote className="mt-3 border-l-2 border-coral pl-3 text-sm italic text-muted-foreground">
                  “{pick(story, "quote")}”
                </blockquote>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20">
        <div className="rounded-2xl bg-ocean p-8 text-ocean-foreground sm:p-12">
          <h2 className="text-display max-w-2xl text-3xl sm:text-4xl">{t("donate.title")}</h2>
          <p className="mt-3 max-w-xl text-sm opacity-85">{t("donate.subtitle")}</p>
          <p className="tabular mt-6 text-sm opacity-80">
            {formatNumber(data.stats.families_supported, lang)} {t("dash.families")}
          </p>
          <Link
            to="/donate"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-coral-foreground transition-opacity hover:opacity-90"
          >
            {t("hero.donate")} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
