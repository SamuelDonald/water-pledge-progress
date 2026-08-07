import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { transparencyQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, formatMonth, formatNumber } from "@/lib/format";
import { StatTile } from "@/components/primitives";

export const Route = createFileRoute("/transparency")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(transparencyQuery);
  },
  head: () => ({
    meta: [
      { title: "Transparency — where every dollar goes" },
      {
        name: "description",
        content:
          "Financial breakdowns, monthly reports, partner organizations and the full delivery log for Water for Puerto Rico.",
      },
      { property: "og:title", content: "Transparency — where every dollar goes" },
      { property: "og:description", content: "Monthly reports, partners and the full delivery log." },
    ],
  }),
  component: TransparencyPage,
});

function TransparencyPage() {
  const { t, lang, pick } = useI18n();
  const { data } = useSuspenseQuery(transparencyQuery);
  const latest = data.reports[0];
  const total = latest ? latest.total_raised_cents || 1 : 1;
  const share = (cents: number) => Math.round((cents / total) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("nav.transparency")}</p>
        <h1 className="text-display mt-3 text-4xl sm:text-5xl">{t("transparency.title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{t("transparency.subtitle")}</p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile tone="ocean" label={t("dash.raised")} value={formatCurrency(data.stats.funds_raised_cents, lang)} />
        <StatTile label={t("dash.liters")} value={`${formatNumber(data.stats.liters_delivered, lang)} L`} />
        <StatTile label={t("dash.families")} value={formatNumber(data.stats.families_supported, lang)} />
        <StatTile label={t("dash.communities")} value={formatNumber(data.stats.communities_reached, lang)} />
      </div>

      {latest ? (
        <section className="mt-14">
          <h2 className="text-display text-2xl">{t("transparency.breakdown")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { label: t("transparency.program"), cents: latest.program_cents },
              { label: t("transparency.admin"), cents: latest.admin_cents },
              { label: t("transparency.processing"), cents: latest.processing_cents },
            ].map((row) => (
              <div key={row.label} className="rounded-xl border border-border bg-card p-5">
                <p className="text-eyebrow text-muted-foreground">{row.label}</p>
                <p className="tabular text-display mt-2 text-3xl">{share(row.cents)}%</p>
                <p className="tabular mt-1 text-xs text-muted-foreground">
                  {formatCurrency(row.cents, lang)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="text-display text-2xl">{t("transparency.reports")}</h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-sand/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">{t("transparency.period")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("transparency.raised")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("transparency.liters")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("transparency.familiesCol")}</th>
              </tr>
            </thead>
            <tbody>
              {data.reports.map((report) => (
                <tr key={report.id} className="border-t border-border/70">
                  <td className="px-4 py-3">{formatMonth(report.period, lang)}</td>
                  <td className="tabular px-4 py-3 text-right">
                    {formatCurrency(report.total_raised_cents, lang)}
                  </td>
                  <td className="tabular px-4 py-3 text-right">
                    {formatNumber(report.liters_delivered, lang)}
                  </td>
                  <td className="tabular px-4 py-3 text-right">
                    {formatNumber(report.families_served, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-display text-2xl">{t("transparency.partners")}</h2>
          <ul className="mt-4 space-y-4">
            {data.partners.map((partner) => (
              <li key={partner.id}>
                <p className="text-sm font-semibold">{partner.name}</p>
                <p className="text-sm text-muted-foreground">{pick(partner, "role")}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-sand/40 p-6">
          <h2 className="text-display text-2xl">{t("transparency.audits")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t("transparency.auditsBody")}</p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-display text-2xl">{t("transparency.deliveryLog")}</h2>
        <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card">
          {data.deliveries.map((delivery) => (
            <li key={delivery.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 text-sm">
              <span className="tabular w-28 text-muted-foreground">
                {formatDate(delivery.delivered_at, lang)}
              </span>
              <span className="font-medium">{delivery.community_name}</span>
              <span className="text-muted-foreground">{t(`kind.${delivery.kind}`)}</span>
              <span className="tabular ml-auto text-muted-foreground">
                {formatNumber(delivery.liters, lang)} L · {formatNumber(delivery.families, lang)}{" "}
                {t("transparency.familiesCol")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
