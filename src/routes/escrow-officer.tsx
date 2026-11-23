import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/escrow-officer")({
  head: () => ({
    meta: [
      { title: "Escrow officer workspace | Liberty Crest Escrow" },
      { name: "description", content: "Review approved releases and record disbursement activity." },
      { property: "og:title", content: "Escrow officer workspace | Liberty Crest Escrow" },
      { property: "og:description", content: "Review approved releases and record disbursement activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <main className="min-h-screen bg-background" />,
});