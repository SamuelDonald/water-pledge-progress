import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import type { CampaignRow } from "@/lib/content-types";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatNumber, progressPercent } from "@/lib/format";
import { campaignImage } from "@/lib/media";
import { DroughtBadge, ProgressBar } from "./primitives";

export function CampaignCard({ campaign }: { campaign: CampaignRow }) {
  const { t, lang, pick } = useI18n();
  const percent = progressPercent(campaign.raised_cents, campaign.goal_cents);
  const urgencyKey = `campaigns.urgency.${campaign.urgency}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link
        to="/campaigns/$slug"
        params={{ slug: campaign.slug }}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <img
          src={campaignImage(campaign.slug)}
          alt={pick(campaign, "name")}
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1 text-xs font-semibold text-coral-foreground">
          {t(urgencyKey)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {campaign.community ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-eyebrow text-muted-foreground">
              {campaign.community.name} · {pick(campaign.community, "region")}
            </span>
            <DroughtBadge level={campaign.community.drought_level} />
          </div>
        ) : null}

        <h3 className="text-display mt-3 text-xl leading-tight">
          <Link to="/campaigns/$slug" params={{ slug: campaign.slug }} className="hover:text-ocean">
            {pick(campaign, "name")}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(campaign, "summary")}</p>

        <div className="mt-auto pt-5">
          <ProgressBar percent={percent} />
          <div className="mt-2.5 flex items-baseline justify-between gap-2 text-sm">
            <span className="tabular font-semibold">
              {formatCurrency(campaign.raised_cents, lang)}{" "}
              <span className="font-normal text-muted-foreground">
                {t("campaigns.of")} {formatCurrency(campaign.goal_cents, lang)}
              </span>
            </span>
            <span className="tabular text-xs font-semibold text-ocean">{percent}%</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {formatNumber(campaign.beneficiaries, lang)} {t("campaigns.beneficiaries")}
            </span>
            <span className="tabular">
              {formatNumber(campaign.donor_count, lang)} {t("campaigns.donors")}
            </span>
          </div>

          <Link
            to="/donate"
            search={{ campaign: campaign.slug }}
            className="mt-4 block rounded-full bg-ocean px-4 py-2.5 text-center text-sm font-semibold text-ocean-foreground transition-opacity hover:opacity-90"
          >
            {t("campaigns.support")}
          </Link>
        </div>
      </div>
    </article>
  );
}
