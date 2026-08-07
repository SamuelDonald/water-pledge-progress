import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const links = [
  { to: "/campaigns", key: "nav.campaigns" },
  { to: "/map", key: "nav.map" },
  { to: "/stories", key: "nav.stories" },
  { to: "/transparency", key: "nav.transparency" },
  { to: "/impact", key: "nav.impact" },
] as const;

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-5">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-8 items-center justify-center rounded-full bg-ocean text-ocean-foreground">
            <Droplets className="size-4" />
          </span>
          <span className="text-display text-lg leading-none sm:text-xl">{t("brand.name")}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div
            className="flex items-center rounded-full border border-border p-0.5"
            role="group"
            aria-label={t("common.language")}
          >
            {(["en", "es"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  lang === code
                    ? "bg-ocean text-ocean-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <Link
            to="/donate"
            className="hidden rounded-full bg-coral px-4 py-2 text-sm font-semibold text-coral-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("nav.donate")}
          </Link>

          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-5 py-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm last:border-0"
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-coral px-4 py-2.5 text-center text-sm font-semibold text-coral-foreground"
            >
              {t("nav.donate")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
