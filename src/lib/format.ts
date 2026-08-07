import type { Lang } from "./i18n";

export function formatCurrency(cents: number, lang: Lang, opts?: { cents?: boolean }) {
  return new Intl.NumberFormat(lang === "es" ? "es-PR" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  }).format(cents / 100);
}

export function formatNumber(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "es" ? "es-PR" : "en-US").format(Math.round(value));
}

export function formatCompact(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "es" ? "es-PR" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "es" ? "es-PR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatMonth(period: string, lang: Lang) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(lang === "es" ? "es-PR" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function progressPercent(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
