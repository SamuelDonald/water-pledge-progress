import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions/$id")({
  head: () => ({
    meta: [
      { title: "Transaction details | Liberty Crest Escrow" },
      { name: "description", content: "View a private Texas escrow transaction record." },
      { property: "og:title", content: "Transaction details | Liberty Crest Escrow" },
      { property: "og:description", content: "View a private Texas escrow transaction record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <main className="min-h-screen bg-background" />,
});