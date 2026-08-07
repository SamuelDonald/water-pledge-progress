import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { storiesQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import { storyImage } from "@/lib/media";

export const Route = createFileRoute("/stories/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(storiesQuery);
  },
  head: () => ({
    meta: [
      { title: "Community stories — Water for Puerto Rico" },
      {
        name: "description",
        content: "Short updates from the people receiving water across Puerto Rico, in their own words.",
      },
      { property: "og:title", content: "Community stories — Water for Puerto Rico" },
      { property: "og:description", content: "Voices from the communities receiving water." },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  const { t, lang, pick } = useI18n();
  const { data: stories } = useSuspenseQuery(storiesQuery);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("nav.stories")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("stories.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("stories.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
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
              <h2 className="text-display mt-2 text-lg leading-snug">
                <Link to="/stories/$slug" params={{ slug: story.slug }} className="hover:text-ocean">
                  {pick(story, "title")}
                </Link>
              </h2>
              <blockquote className="mt-3 border-l-2 border-coral pl-3 text-sm italic text-muted-foreground">
                “{pick(story, "quote")}”
              </blockquote>
              <p className="mt-3 text-xs text-muted-foreground">
                {story.author_name} — {pick(story, "author_role")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
