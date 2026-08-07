import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

const droughtBg = ["bg-drought-0", "bg-drought-1", "bg-drought-2", "bg-drought-3", "bg-drought-4"];

export function DroughtBadge({ level, className = "" }: { level: number; className?: string }) {
  const { t } = useI18n();
  const clamped = Math.max(0, Math.min(4, Math.round(level)));
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium ${className}`}
    >
      <span className={`size-2 rounded-full ${droughtBg[clamped]}`} aria-hidden="true" />
      D{clamped} · {t(`drought.${clamped}`)}
    </span>
  );
}

export function droughtColorVar(level: number) {
  const clamped = Math.max(0, Math.min(4, Math.round(level)));
  return `var(--drought-${clamped})`;
}

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: "default" | "ocean" | "coral";
}) {
  const toneClass =
    tone === "ocean"
      ? "bg-ocean text-ocean-foreground border-ocean"
      : tone === "coral"
        ? "bg-coral text-coral-foreground border-coral"
        : "bg-card text-card-foreground border-border";

  return (
    <div className={`rounded-xl border p-5 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-eyebrow opacity-70">{label}</span>
        {icon ? <span className="opacity-60">{icon}</span> : null}
      </div>
      <p className="text-display tabular mt-3 text-3xl sm:text-4xl">{value}</p>
      {sub ? <p className="mt-1.5 text-xs opacity-65">{sub}</p> : null}
    </div>
  );
}

export function ProgressBar({ percent, tone = "ocean" }: { percent: number; tone?: "ocean" | "coral" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-deep/60" role="presentation">
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${tone === "coral" ? "bg-coral" : "bg-ocean"}`}
        style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
