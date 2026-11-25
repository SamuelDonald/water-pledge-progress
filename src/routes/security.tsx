import { createFileRoute } from "@tanstack/react-router";
import { PublicSiteFrame } from "@/components/escrow/PublicSiteFrame";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & FAQs | Liberty Crest Escrow" },
      { name: "description", content: "How we protect transaction records, documents and approvals, plus answers to common questions." },
      { property: "og:title", content: "Security & FAQs | Liberty Crest Escrow" },
      { property: "og:description", content: "How we protect transaction records, documents and approvals, plus answers to common questions." },
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
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Security & FAQs</h1>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">How we protect transaction records, documents and approvals, plus answers to common questions.</p>
      </main>
    </PublicSiteFrame>
  );
}
