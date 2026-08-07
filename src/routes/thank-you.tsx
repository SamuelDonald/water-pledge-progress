import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank you — Water for Puerto Rico" },
      {
        name: "description",
        content: "Your gift is recorded. Delivery evidence is published on the campaign page you funded.",
      },
      { property: "og:title", content: "Thank you — Water for Puerto Rico" },
      { property: "og:description", content: "Your gift is recorded and will be traced to a delivery." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-24 text-center">
      <h1 className="text-display text-4xl sm:text-5xl">{t("thanks.title")}</h1>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("thanks.body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/impact"
          className="rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-ocean-foreground"
        >
          {t("thanks.viewImpact")}
        </Link>
        <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">
          {t("thanks.backHome")}
        </Link>
      </div>
    </div>
  );
}
