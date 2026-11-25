import { createFileRoute } from "@tanstack/react-router";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works | Liberty Crest Escrow" },
      { name: "description", content: "From invitation to verified release, every Texas escrow step is tracked with clear approvals." },
      { property: "og:title", content: "How it works | Liberty Crest Escrow" },
      { property: "og:description", content: "From invitation to verified release, every Texas escrow step is tracked with clear approvals." },
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
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">How it works</h1>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">From invitation to verified release, every Texas escrow step is tracked with clear approvals.</p>
      </main>
    </PublicSiteFrame>
  );
}
