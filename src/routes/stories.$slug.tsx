import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { storyQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { storyImage } from "@/lib/media";

export const Route = createFileRoute("/stories/$slug")({
  loader: async ({ context, params }) => {
    const story = await context.queryClient.ensureQueryData(storyQuery(params.slug));
    if (!story) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Community story` },
      {
        name: "description",
        content: "A first-person account from a Puerto Rican community receiving clean water.",
      },
      { property: "og:title", content: "Community story — Water for Puerto Rico" },
      {
        property: "og:description",
        content: "A first-person account from a community receiving clean water.",
      },
    ],
  }),
  component: StoryDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-display text-3xl">Story not found</h1>
    </div>
  ),
});

function StoryDetail() {
  const { slug } = Route.useParams();
  const { t, lang, pick } = useI18n();
  const { data: story } = useSuspenseQuery(storyQuery(slug));

  if (!story) return null;

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
      <Link
        to="/stories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t("nav.stories")}
      </Link>

      <p className="text-eyebrow mt-6 text-muted-foreground">
        {story.community_name} · {formatDate(story.published_at, lang)}
      </p>
      <h1 className="text-display mt-3 text-3xl leading-tight sm:text-5xl">{pick(story, "title")}</h1>

      <img
        src={storyImage(story.slug)}
        alt={pick(story, "title")}
        className="mt-8 aspect-[16/9] w-full rounded-xl object-cover"
      />

      <blockquote className="text-display mt-8 border-l-2 border-coral pl-5 text-xl italic leading-snug">
        “{pick(story, "quote")}”
      </blockquote>
      <p className="mt-3 text-sm text-muted-foreground">
        {story.author_name} — {pick(story, "author_role")}
      </p>

      <div className="mt-8 space-y-4 text-base leading-relaxed">
        {pick(story, "body")
          .split("\n")
          .filter(Boolean)
          .map((para, i) => (
            <p key={i}>{para}</p>
          ))}
      </div>

      {story.campaign_slug ? (
        <div className="mt-10 rounded-xl border border-border bg-sand/40 p-5">
          <p className="text-eyebrow text-ocean">{t("stories.relatedCampaign")}</p>
          <Link
            to="/campaigns/$slug"
            params={{ slug: story.campaign_slug }}
            className="text-display mt-2 block text-xl hover:text-ocean"
          >
            {lang === "es" ? story.campaign_name_es : story.campaign_name_en}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
