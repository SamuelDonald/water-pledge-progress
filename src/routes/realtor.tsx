import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/realtor")({
  head: () => ({
    meta: [
      { title: "Realtor workspace | Liberty Crest Escrow" },
      { name: "description", content: "Manage Texas escrow transactions and buyer invitations." },
      { property: "og:title", content: "Realtor workspace | Liberty Crest Escrow" },
      { property: "og:description", content: "Manage Texas escrow transactions and buyer invitations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <main className="min-h-screen bg-background" />,
});