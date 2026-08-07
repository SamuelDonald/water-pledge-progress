import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

const STORAGE_KEY = "wfpr-lang";

type Dict = Record<string, { en: string; es: string }>;

export const dict: Dict = {
  // Brand + nav
  "brand.name": { en: "Water for Puerto Rico", es: "Agua para Puerto Rico" },
  "nav.campaigns": { en: "Campaigns", es: "Campañas" },
  "nav.map": { en: "Emergency map", es: "Mapa de emergencia" },
  "nav.stories": { en: "Stories", es: "Historias" },
  "nav.transparency": { en: "Transparency", es: "Transparencia" },
  "nav.impact": { en: "My impact", es: "Mi impacto" },
  "nav.donate": { en: "Donate", es: "Donar" },
  "nav.menu": { en: "Menu", es: "Menú" },

  // Hero
  "hero.eyebrow": { en: "Active drought emergency", es: "Emergencia de sequía activa" },
  "hero.title": {
    en: "Help Puerto Rico access clean water again",
    es: "Ayuda a Puerto Rico a tener agua limpia otra vez",
  },
  "hero.body": {
    en: "Thousands of families are living through water shortages caused by severe drought and aging infrastructure. Your donation helps deliver clean water and essential supplies to communities in need.",
    es: "Miles de familias viven con escasez de agua causada por una sequía severa y una infraestructura envejecida. Tu donación ayuda a llevar agua limpia y suministros esenciales a las comunidades que lo necesitan.",
  },
  "hero.donate": { en: "Donate now", es: "Donar ahora" },
  "hero.impact": { en: "View impact", es: "Ver impacto" },
  "hero.caption": {
    en: "A municipal tanker serves households during a 48-hour service interruption.",
    es: "Un camión cisterna municipal atiende hogares durante una interrupción de servicio de 48 horas.",
  },

  // Dashboard
  "dash.title": { en: "Live crisis dashboard", es: "Panel de crisis en vivo" },
  "dash.subtitle": {
    en: "Every figure below is computed from delivery records and completed donations, not from marketing estimates.",
    es: "Cada cifra aquí se calcula a partir de registros de entrega y donaciones completadas, no de estimados de mercadeo.",
  },
  "dash.families": { en: "Families supported", es: "Familias apoyadas" },
  "dash.liters": { en: "Water delivered", es: "Agua entregada" },
  "dash.communities": { en: "Communities reached", es: "Comunidades alcanzadas" },
  "dash.campaigns": { en: "Active campaigns", es: "Campañas activas" },
  "dash.raised": { en: "Funds raised", es: "Fondos recaudados" },
  "dash.drought": { en: "Drought severity", es: "Severidad de la sequía" },
  "dash.reservoir": { en: "Reservoir status", es: "Estado de los embalses" },
  "dash.reservoirPending": {
    en: "Live reservoir feed pending integration",
    es: "Integración de embalses en vivo pendiente",
  },
  "dash.litersUnit": { en: "liters", es: "litros" },
  "dash.donors": { en: "donors", es: "donantes" },

  // Drought levels
  "drought.0": { en: "Abnormally dry", es: "Anormalmente seco" },
  "drought.1": { en: "Moderate drought", es: "Sequía moderada" },
  "drought.2": { en: "Severe drought", es: "Sequía severa" },
  "drought.3": { en: "Extreme drought", es: "Sequía extrema" },
  "drought.4": { en: "Exceptional drought", es: "Sequía excepcional" },

  // Campaigns
  "campaigns.title": { en: "Verified community campaigns", es: "Campañas comunitarias verificadas" },
  "campaigns.subtitle": {
    en: "Each campaign is tied to one community and one specific need. Progress updates and delivery evidence are published on the campaign page.",
    es: "Cada campaña está ligada a una comunidad y a una necesidad específica. Las actualizaciones y la evidencia de entrega se publican en la página de la campaña.",
  },
  "campaigns.viewAll": { en: "View all campaigns", es: "Ver todas las campañas" },
  "campaigns.raised": { en: "raised", es: "recaudado" },
  "campaigns.of": { en: "of", es: "de" },
  "campaigns.goal": { en: "goal", es: "meta" },
  "campaigns.beneficiaries": { en: "people served", es: "personas atendidas" },
  "campaigns.need": { en: "Specific need", es: "Necesidad específica" },
  "campaigns.support": { en: "Support this campaign", es: "Apoyar esta campaña" },
  "campaigns.updates": { en: "Latest updates", es: "Últimas actualizaciones" },
  "campaigns.noUpdates": { en: "No updates published yet.", es: "Aún no hay actualizaciones publicadas." },
  "campaigns.gallery": { en: "From the field", es: "Desde el terreno" },
  "campaigns.community": { en: "Community", es: "Comunidad" },
  "campaigns.donors": { en: "donors", es: "donantes" },
  "campaigns.relatedStories": { en: "Stories from this community", es: "Historias de esta comunidad" },
  "campaigns.notFound": { en: "Campaign not found", es: "Campaña no encontrada" },
  "campaigns.urgency.critical": { en: "Critical", es: "Crítico" },
  "campaigns.urgency.high": { en: "Urgent", es: "Urgente" },
  "campaigns.urgency.medium": { en: "Ongoing", es: "En curso" },

  // Donate
  "donate.title": { en: "Fund clean water today", es: "Financia agua limpia hoy" },
  "donate.subtitle": {
    en: "Choose an amount and a campaign. You will see exactly what your gift funds before you confirm.",
    es: "Elige un monto y una campaña. Verás exactamente qué financia tu donación antes de confirmar.",
  },
  "donate.frequency": { en: "Frequency", es: "Frecuencia" },
  "donate.once": { en: "One-time", es: "Una vez" },
  "donate.monthly": { en: "Monthly", es: "Mensual" },
  "donate.amount": { en: "Amount", es: "Monto" },
  "donate.custom": { en: "Custom amount", es: "Monto personalizado" },
  "donate.chooseCampaign": { en: "Where should it go?", es: "¿A dónde debe ir?" },
  "donate.mostUrgent": { en: "Wherever it is most urgent", es: "Donde sea más urgente" },
  "donate.yourDetails": { en: "Your details", es: "Tus datos" },
  "donate.name": { en: "Full name", es: "Nombre completo" },
  "donate.email": { en: "Email", es: "Correo electrónico" },
  "donate.emailHelp": {
    en: "Used for your receipt and your impact dashboard.",
    es: "Se usa para tu recibo y tu panel de impacto.",
  },
  "donate.anonymous": { en: "Give anonymously", es: "Donar de forma anónima" },
  "donate.dedication": { en: "Dedication or note (optional)", es: "Dedicatoria o nota (opcional)" },
  "donate.continue": { en: "Continue to secure checkout", es: "Continuar al pago seguro" },
  "donate.processing": { en: "Preparing checkout…", es: "Preparando el pago…" },
  "donate.impactPreview": { en: "What this funds", es: "Qué financia esto" },
  "donate.litersFunded": { en: "liters of clean water", es: "litros de agua limpia" },
  "donate.familiesFunded": { en: "families reached", es: "familias alcanzadas" },
  "donate.monthlyNote": {
    en: "A monthly gift keeps truck routes and filter replacements funded through the whole dry season.",
    es: "Una donación mensual mantiene financiadas las rutas de camiones y el reemplazo de filtros durante toda la temporada seca.",
  },
  "donate.methods": {
    en: "Card, Apple Pay and Google Pay are handled by our payment processor. We never see or store your card details.",
    es: "Tarjeta, Apple Pay y Google Pay son manejados por nuestro procesador de pagos. Nunca vemos ni almacenamos los datos de tu tarjeta.",
  },
  "donate.pendingTitle": { en: "Checkout is not connected yet", es: "El pago aún no está conectado" },
  "donate.pendingBody": {
    en: "Your donation details were saved as a pending record, but no card can be charged until the payment processor is connected to this site.",
    es: "Los detalles de tu donación se guardaron como registro pendiente, pero no se puede cobrar ninguna tarjeta hasta que el procesador de pagos esté conectado a este sitio.",
  },
  "donate.errorAmount": { en: "Enter an amount of at least $1.", es: "Introduce un monto de al menos $1." },
  "donate.errorEmail": { en: "Enter a valid email address.", es: "Introduce un correo electrónico válido." },
  "donate.errorName": { en: "Enter your name.", es: "Introduce tu nombre." },
  "donate.forCampaign": { en: "Supporting", es: "Apoyando a" },

  // Impact
  "impact.title": { en: "Your impact dashboard", es: "Tu panel de impacto" },
  "impact.subtitle": {
    en: "Sign in with the email you donated with to see your history, the communities you funded, and your receipts.",
    es: "Inicia sesión con el correo que usaste para donar y verás tu historial, las comunidades que financiaste y tus recibos.",
  },
  "impact.signIn": { en: "Email me a sign-in link", es: "Envíame un enlace de acceso" },
  "impact.sending": { en: "Sending…", es: "Enviando…" },
  "impact.linkSent": {
    en: "Check your inbox for a sign-in link.",
    es: "Revisa tu correo para el enlace de acceso.",
  },
  "impact.signOut": { en: "Sign out", es: "Cerrar sesión" },
  "impact.totalDonated": { en: "Total donated", es: "Total donado" },
  "impact.campaignsSupported": { en: "Campaigns supported", es: "Campañas apoyadas" },
  "impact.familiesHelped": { en: "Families helped", es: "Familias ayudadas" },
  "impact.litersFunded": { en: "Liters funded", es: "Litros financiados" },
  "impact.history": { en: "Your donations", es: "Tus donaciones" },
  "impact.receipt": { en: "Receipt", es: "Recibo" },
  "impact.updatesTitle": {
    en: "Updates from communities you funded",
    es: "Actualizaciones de las comunidades que financiaste",
  },
  "impact.empty": {
    en: "No donations are linked to this email yet.",
    es: "Todavía no hay donaciones ligadas a este correo.",
  },
  "impact.recurring": { en: "Monthly", es: "Mensual" },
  "impact.oneTime": { en: "One-time", es: "Una vez" },

  // Stories
  "stories.title": { en: "Community stories", es: "Historias de la comunidad" },
  "stories.subtitle": {
    en: "Short updates recorded by the people receiving water, in their own words.",
    es: "Breves relatos grabados por las personas que reciben el agua, en sus propias palabras.",
  },
  "stories.read": { en: "Read the story", es: "Leer la historia" },
  "stories.back": { en: "All stories", es: "Todas las historias" },
  "stories.notFound": { en: "Story not found", es: "Historia no encontrada" },
  "stories.relatedCampaign": { en: "Related campaign", es: "Campaña relacionada" },

  // Map
  "map.title": { en: "Emergency map", es: "Mapa de emergencia" },
  "map.subtitle": {
    en: "Drought severity by municipality, communities receiving aid, active campaigns and logged distribution points.",
    es: "Severidad de la sequía por municipio, comunidades que reciben ayuda, campañas activas y puntos de distribución registrados.",
  },
  "map.legend": { en: "Drought severity", es: "Severidad de la sequía" },
  "map.deliveries": { en: "Recent deliveries", es: "Entregas recientes" },
  "map.families": { en: "families served", es: "familias atendidas" },
  "map.loading": { en: "Loading map…", es: "Cargando el mapa…" },
  "map.activeCampaign": { en: "Active campaign", es: "Campaña activa" },
  "map.noCampaign": { en: "No active campaign", es: "Sin campaña activa" },

  // Transparency
  "transparency.title": { en: "Where every dollar goes", es: "A dónde va cada dólar" },
  "transparency.subtitle": {
    en: "Financial breakdowns, monthly reports, partner organizations and delivery metrics. Published whether the numbers flatter us or not.",
    es: "Desglose financiero, informes mensuales, organizaciones aliadas y métricas de entrega. Publicado sin importar si los números nos favorecen.",
  },
  "transparency.breakdown": { en: "How funds are used", es: "Cómo se usan los fondos" },
  "transparency.program": { en: "Direct program delivery", es: "Entrega directa del programa" },
  "transparency.admin": { en: "Administration", es: "Administración" },
  "transparency.processing": { en: "Payment processing", es: "Procesamiento de pagos" },
  "transparency.reports": { en: "Monthly reports", es: "Informes mensuales" },
  "transparency.period": { en: "Period", es: "Período" },
  "transparency.raised": { en: "Raised", es: "Recaudado" },
  "transparency.audits": { en: "Independent audits", es: "Auditorías independientes" },
  "transparency.auditsBody": {
    en: "No independent audit has been completed yet. The first external review is scheduled after twelve months of operations, and the full report will be published here unedited.",
    es: "Aún no se ha completado ninguna auditoría independiente. La primera revisión externa está programada tras doce meses de operación, y el informe completo se publicará aquí sin editar.",
  },
  "transparency.partners": { en: "Partner organizations", es: "Organizaciones aliadas" },
  "transparency.metrics": { en: "Delivery metrics", es: "Métricas de entrega" },
  "transparency.deliveryLog": { en: "Delivery log", es: "Registro de entregas" },
  "transparency.date": { en: "Date", es: "Fecha" },
  "transparency.community": { en: "Community", es: "Comunidad" },
  "transparency.type": { en: "Type", es: "Tipo" },
  "transparency.liters": { en: "Liters", es: "Litros" },
  "transparency.familiesCol": { en: "Families", es: "Familias" },
  "transparency.teaser": {
    en: "88% of every dollar reaches delivery. See the full breakdown.",
    es: "88% de cada dólar llega a la entrega. Ve el desglose completo.",
  },

  // Delivery kinds
  "kind.truck": { en: "Truck delivery", es: "Entrega en camión" },
  "kind.bottled_water": { en: "Bottled water", es: "Agua embotellada" },
  "kind.filters": { en: "Household filters", es: "Filtros domésticos" },
  "kind.station": { en: "School station", es: "Estación escolar" },
  "kind.cistern": { en: "Community cistern", es: "Cisterna comunitaria" },

  // Thank you
  "thanks.title": { en: "Thank you", es: "Gracias" },
  "thanks.body": {
    en: "Your gift is recorded. Delivery evidence for the campaign you funded is published on its campaign page, usually within 72 hours.",
    es: "Tu donación quedó registrada. La evidencia de entrega de la campaña que financiaste se publica en su página, normalmente en un plazo de 72 horas.",
  },
  "thanks.viewImpact": { en: "Open my impact dashboard", es: "Abrir mi panel de impacto" },
  "thanks.backHome": { en: "Back to home", es: "Volver al inicio" },

  // Footer + misc
  "footer.tagline": {
    en: "A transparency-first platform funding clean water for Puerto Rican communities.",
    es: "Una plataforma centrada en la transparencia que financia agua limpia para las comunidades de Puerto Rico.",
  },
  "footer.explore": { en: "Explore", es: "Explora" },
  "footer.about": { en: "About", es: "Sobre" },
  "footer.dataNote": {
    en: "Content on this site is sample reporting used to demonstrate the platform. Drought severity is entered manually until the live drought monitor feed is connected.",
    es: "El contenido de este sitio es información de muestra para demostrar la plataforma. La severidad de la sequía se ingresa manualmente hasta que se conecte el monitor de sequía en vivo.",
  },
  "footer.rights": { en: "All rights reserved.", es: "Todos los derechos reservados." },
  "common.back": { en: "Back", es: "Volver" },
  "common.loading": { en: "Loading…", es: "Cargando…" },
  "common.error": { en: "Something went wrong.", es: "Algo salió mal." },
  "common.language": { en: "Language", es: "Idioma" },
};

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
  pick: <T extends Record<string, unknown>>(row: T, base: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") setLangState(stored);
    else if (navigator.language?.toLowerCase().startsWith("es")) setLangState("es");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = dict[key];
      return entry ? entry[lang] : key;
    },
    [lang],
  );

  const pick = useCallback(
    <T extends Record<string, unknown>>(row: T, base: string) => {
      const value = row[`${base}_${lang}`] ?? row[`${base}_en`] ?? "";
      return typeof value === "string" ? value : "";
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t, pick }), [lang, setLang, t, pick]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
