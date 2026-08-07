import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyDonations } from "@/lib/content.functions";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { StatTile } from "@/components/primitives";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "My impact dashboard — Water for Puerto Rico" },
      {
        name: "description",
        content:
          "Sign in to see your donation history, the communities you funded, liters delivered and your receipts.",
      },
      { property: "og:title", content: "My impact dashboard — Water for Puerto Rico" },
      { property: "og:description", content: "Your donations, traced to real deliveries." },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const { t, lang } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  const donationsQuery = useQuery({
    queryKey: ["my-donations", session?.user.id ?? "anon"],
    queryFn: () => getMyDonations(),
    enabled: Boolean(session),
  });

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/impact` },
    });
    setSending(false);
    setSent(true);
  }

  const donations = donationsQuery.data ?? [];
  const totals = donations.reduce(
    (acc, d) => ({
      cents: acc.cents + d.amount_cents,
      liters: acc.liters + d.liters_funded,
      campaigns: acc.campaigns.add(d.campaign_id ?? "general"),
    }),
    { cents: 0, liters: 0, campaigns: new Set<string>() },
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("nav.impact")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("impact.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("impact.subtitle")}</p>
      </header>

      {!session ? (
        <form onSubmit={signIn} className="mt-8 max-w-md rounded-xl border border-border bg-card p-6">
          <label className="block">
            <span className="text-xs text-muted-foreground">{t("donate.email")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="mt-4 w-full rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-ocean-foreground disabled:opacity-60"
          >
            {sending ? t("impact.sending") : t("impact.signIn")}
          </button>
          {sent ? <p className="mt-3 text-sm text-muted-foreground">{t("impact.linkSent")}</p> : null}
        </form>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium"
            >
              {t("impact.signOut")}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile tone="ocean" label={t("impact.totalDonated")} value={formatCurrency(totals.cents, lang)} />
            <StatTile label={t("impact.litersFunded")} value={`${formatNumber(totals.liters, lang)} L`} />
            <StatTile
              label={t("impact.campaignsSupported")}
              value={formatNumber(totals.campaigns.size, lang)}
            />
          </div>

          <section className="mt-12">
            <h2 className="text-display text-2xl">{t("impact.history")}</h2>
            {donationsQuery.isLoading ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("common.loading")}</p>
            ) : donations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("impact.empty")}</p>
            ) : (
              <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card">
                {donations.map((donation) => (
                  <li key={donation.id} className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
                    <span className="tabular w-28 text-muted-foreground">
                      {formatDate(donation.created_at, lang)}
                    </span>
                    {donation.campaign_slug ? (
                      <Link
                        to="/campaigns/$slug"
                        params={{ slug: donation.campaign_slug }}
                        className="font-medium text-ocean hover:underline"
                      >
                        {lang === "es" ? donation.campaign_name_es : donation.campaign_name_en}
                      </Link>
                    ) : (
                      <span className="font-medium">{t("donate.mostUrgent")}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {donation.frequency === "monthly" ? t("impact.recurring") : t("impact.oneTime")}
                    </span>
                    <span className="tabular ml-auto font-semibold">
                      {formatCurrency(donation.amount_cents, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
