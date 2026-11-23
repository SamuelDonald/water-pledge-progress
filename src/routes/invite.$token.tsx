import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({
    meta: [
      { title: "Transaction invitation | Liberty Crest Escrow" },
      { name: "description", content: "Open a private Liberty Crest transaction invitation." },
      { property: "og:title", content: "Transaction invitation | Liberty Crest Escrow" },
      { property: "og:description", content: "Open a private Liberty Crest transaction invitation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <main className="min-h-screen bg-background" />,
});