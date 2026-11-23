import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Secure sign-in | Liberty Crest Escrow" },
      { name: "description", content: "Secure email sign-in for Liberty Crest Escrow Services." },
      { property: "og:title", content: "Secure sign-in | Liberty Crest Escrow" },
      { property: "og:description", content: "Secure email sign-in for Liberty Crest Escrow Services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <main className="min-h-screen bg-background" />,
});