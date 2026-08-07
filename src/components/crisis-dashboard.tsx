import { Droplets, HandHeart, MapPin, Megaphone, Users } from "lucide-react";
import type { CommunityRow, CrisisStats } from "@/lib/content-types";
import { useI18n } from "@/lib/i18n";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { DroughtBadge, StatTile } from "./primitives";

export function CrisisDashboard({
  stats,
  communities,
}: {
  stats: CrisisStats;
  communities: CommunityRow[];
}) {
  const { t, lang } = useI18n();
  const worst = communities.slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:py-20" id="dashboard">
      <div className="max-w-2xl">
        <p className="text-eyebrow text-coral">{t("dash.title")}</p>
        <h2 className="text-display mt-3 text-3xl sm:text-4xl">{t("dash.drought")}</h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("dash.subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          tone="ocean"
          label={t("dash.raised")}
          value={formatCurrency(stats.funds_raised_cents, lang)}
          sub={`${formatNumber(stats.donor_count, lang)} ${t("dash.donors")}`}
          icon={<HandHeart className="size-4" />}
        />
        <StatTile
          label={t("dash.liters")}
          value={`${formatCompact(stats.liters_delivered, lang)} L`}
          sub={t("dash.litersUnit")}
          icon={<Droplets className="size-4" />}
        />
        <StatTile
          label={t("dash.families")}
          value={formatNumber(stats.families_supported, lang)}
          icon={<Users className="size-4" />}
        />
        <StatTile
          label={t("dash.communities")}
          value={formatNumber(stats.communities_reached, lang)}
          sub={`${formatNumber(stats.active_campaigns, lang)} ${t("dash.campaigns")}`}
          icon={<MapPin className="size-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-eyebrow text-muted-foreground">{t("map.legend")}</h3>
          <ul className="mt-4 divide-y divide-border/70">
            {worst.map((community) => (
              <li key={community.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="min-w-32 text-sm font-medium">{community.name}</span>
                <DroughtBadge level={community.drought_level} />
                <span className="tabular ml-auto text-xs text-muted-foreground">
                  {formatNumber(community.families_served, lang)} {t("map.families")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-sand/40 p-5">
          <h3 className="text-eyebrow text-muted-foreground">{t("dash.reservoir")}</h3>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Megaphone className="size-4 shrink-0" />
            {t("dash.reservoirPending")}
          </p>
        </div>
      </div>
    </section>
  );
}
