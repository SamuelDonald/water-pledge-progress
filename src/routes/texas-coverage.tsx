import { createFileRoute } from "@tanstack/react-router";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";

export const Route = createFileRoute("/texas-coverage")({
  head: () => ({
    meta: [
      { title: "Texas coverage | Liberty Crest Escrow" },
      { name: "description", content: "Residential escrow coordination across Dallas, Houston, Austin, San Antonio and the Rio Grande Valley." },
      { property: "og:title", content: "Texas coverage | Liberty Crest Escrow" },
      { property: "og:description", content: "Residential escrow coordination across Dallas, Houston, Austin, San Antonio and the Rio Grande Valley." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PublicSiteFrame>
      <main className="mx-auto max-w-4xl px-5 py-16 md:px-8">
        <p className="eyebrow">Liberty Crest Escrow</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Texas coverage</h1>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">Residential escrow coordination across Dallas, Houston, Austin, San Antonio and the Rio Grande Valley.</p>
      </main>
    </PublicSiteFrame>
  );
}
