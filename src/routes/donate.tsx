import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { campaignsQuery } from "@/lib/queries";
import { startDonation } from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatNumber } from "@/lib/format";

const PRESETS = [2500, 5000, 10000, 25000];

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>) => ({
    campaign: typeof search["campaign"] === "string" ? String(search["campaign"]).slice(0, 120) : undefined,
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(campaignsQuery);
  },
  head: () => ({
    meta: [
      { title: "Donate — fund clean water in Puerto Rico" },
      {
        name: "description",
        content:
          "Give once or monthly to fund trucked water, filters and cisterns for Puerto Rican communities. See exactly what your gift funds.",
      },
      { property: "og:title", content: "Donate — fund clean water in Puerto Rico" },
      { property: "og:description", content: "See exactly what your gift funds before you confirm." },
    ],
  }),
  component: DonatePage,
});

function DonatePage() {
  const { campaign: campaignParam } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang, pick } = useI18n();
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);

  const [frequency, setFrequency] = useState<"one_time" | "monthly">("one_time");
  const [amountCents, setAmountCents] = useState(5000);
  const [custom, setCustom] = useState("");
  const [slug, setSlug] = useState(campaignParam ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [dedication, setDedication] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = campaigns.find((c) => c.slug === slug) ?? null;
  const litersPerUsd = selected?.liters_per_usd ?? 40;
  const liters = Math.round((amountCents / 100) * litersPerUsd);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (amountCents < 100) return setError(t("donate.errorAmount"));
    if (name.trim().length < 2) return setError(t("donate.errorName"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setError(t("donate.errorEmail"));

    setPending(true);
    try {
      const result = await startDonation({
        data: {
          amountCents,
          frequency,
          campaignSlug: slug || null,
          donorEmail: email,
          donorName: name,
          isAnonymous: anonymous,
          dedication: dedication || null,
        },
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (!result.checkoutConfigured) {
        setNotice(t("donate.pendingBody"));
        setPending(false);
        return;
      }
      navigate({ to: "/thank-you" });
    } catch {
      setError(t("common.error"));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("nav.donate")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("donate.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("donate.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <fieldset>
            <legend className="text-eyebrow text-muted-foreground">{t("donate.frequency")}</legend>
            <div className="mt-3 inline-flex rounded-full border border-border p-1">
              {(["one_time", "monthly"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value)}
                  aria-pressed={frequency === value}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    frequency === value ? "bg-ocean text-ocean-foreground" : "text-muted-foreground"
                  }`}
                >
                  {value === "monthly" ? t("donate.monthly") : t("donate.once")}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-7">
            <legend className="text-eyebrow text-muted-foreground">{t("donate.amount")}</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmountCents(preset);
                    setCustom("");
                  }}
                  aria-pressed={amountCents === preset && custom === ""}
                  className={`tabular rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    amountCents === preset && custom === ""
                      ? "border-ocean bg-ocean text-ocean-foreground"
                      : "border-border hover:border-ocean"
                  }`}
                >
                  {formatCurrency(preset, lang)}
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="sr-only">{t("donate.custom")}</span>
              <input
                type="number"
                min="1"
                max="100000"
                inputMode="decimal"
                placeholder={t("donate.custom")}
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  const parsed = Math.round(Number(e.target.value) * 100);
                  if (Number.isFinite(parsed)) setAmountCents(parsed);
                }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </label>
          </fieldset>

          <label className="mt-7 block">
            <span className="text-eyebrow text-muted-foreground">{t("donate.chooseCampaign")}</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value="">{t("donate.mostUrgent")}</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.slug}>
                  {pick(campaign, "name")}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="mt-7">
            <legend className="text-eyebrow text-muted-foreground">{t("donate.yourDetails")}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">{t("donate.name")}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  required
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">{t("donate.email")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  required
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("donate.emailHelp")}</p>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="size-4 rounded border-input"
              />
              {t("donate.anonymous")}
            </label>

            <label className="mt-4 block">
              <span className="text-xs text-muted-foreground">{t("donate.dedication")}</span>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
              />
            </label>
          </fieldset>

          {error ? <p className="mt-5 text-sm font-medium text-destructive">{error}</p> : null}
          {notice ? (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-sand/40 p-4">
              <p className="text-sm font-semibold">{t("donate.pendingTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{notice}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-coral-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? t("donate.processing") : t("donate.continue")}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">{t("donate.methods")}</p>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-sand/50 p-6">
            <h2 className="text-eyebrow text-ocean">{t("donate.impactPreview")}</h2>
            <p className="tabular text-display mt-3 flex items-center gap-2 text-3xl">
              <Droplets className="size-6 text-ocean" />
              {formatNumber(liters, lang)}
            </p>
            <p className="text-sm text-muted-foreground">{t("donate.litersFunded")}</p>
            {selected ? (
              <p className="mt-4 text-sm">
                <span className="text-muted-foreground">{t("donate.forCampaign")} </span>
                <Link
                  to="/campaigns/$slug"
                  params={{ slug: selected.slug }}
                  className="font-semibold text-ocean hover:underline"
                >
                  {pick(selected, "name")}
                </Link>
              </p>
            ) : null}
            {frequency === "monthly" ? (
              <p className="mt-4 text-xs text-muted-foreground">{t("donate.monthlyNote")}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
