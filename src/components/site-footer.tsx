import { Link } from "@tanstack/react-router";
import { Droplets } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-ocean-deep text-sand">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-seafoam text-ocean-deep">
              <Droplets className="size-4" />
            </span>
            <span className="text-display text-xl">{t("brand.name")}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-sand/70">{t("footer.tagline")}</p>
          <p className="mt-6 max-w-sm text-xs leading-relaxed text-sand/50">{t("footer.dataNote")}</p>
        </div>

        <div>
          <h2 className="text-eyebrow text-seafoam">{t("footer.explore")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/campaigns" className="text-sand/80 hover:text-sand">
                {t("nav.campaigns")}
              </Link>
            </li>
            <li>
              <Link to="/map" className="text-sand/80 hover:text-sand">
                {t("nav.map")}
              </Link>
            </li>
            <li>
              <Link to="/stories" className="text-sand/80 hover:text-sand">
                {t("nav.stories")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-eyebrow text-seafoam">{t("footer.about")}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/transparency" className="text-sand/80 hover:text-sand">
                {t("nav.transparency")}
              </Link>
            </li>
            <li>
              <Link to="/impact" className="text-sand/80 hover:text-sand">
                {t("nav.impact")}
              </Link>
            </li>
            <li>
              <Link to="/donate" className="font-semibold text-seafoam hover:text-sand">
                {t("nav.donate")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand/10 px-5 py-5">
        <p className="mx-auto w-full max-w-7xl text-xs text-sand/45">
          © {year} WaterForPuertoRico.org — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
