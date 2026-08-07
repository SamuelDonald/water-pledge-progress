-- ============ TABLES ============
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  region_en text NOT NULL DEFAULT '',
  region_es text NOT NULL DEFAULT '',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  drought_level int NOT NULL DEFAULT 0,
  population int NOT NULL DEFAULT 0,
  families_served int NOT NULL DEFAULT 0,
  liters_delivered bigint NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  name_en text NOT NULL,
  name_es text NOT NULL,
  need_en text NOT NULL,
  need_es text NOT NULL,
  summary_en text NOT NULL DEFAULT '',
  summary_es text NOT NULL DEFAULT '',
  story_en text NOT NULL DEFAULT '',
  story_es text NOT NULL DEFAULT '',
  goal_cents bigint NOT NULL DEFAULT 0,
  seed_raised_cents bigint NOT NULL DEFAULT 0,
  beneficiaries int NOT NULL DEFAULT 0,
  liters_per_usd numeric NOT NULL DEFAULT 40,
  hero_image_url text,
  status text NOT NULL DEFAULT 'active',
  urgency text NOT NULL DEFAULT 'high',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  media_type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  caption_en text NOT NULL DEFAULT '',
  caption_es text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_es text NOT NULL,
  body_en text NOT NULL DEFAULT '',
  body_es text NOT NULL DEFAULT '',
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  title_en text NOT NULL,
  title_es text NOT NULL,
  quote_en text NOT NULL DEFAULT '',
  quote_es text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_es text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  author_role_en text NOT NULL DEFAULT '',
  author_role_es text NOT NULL DEFAULT '',
  image_url text,
  video_url text,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'bottled_water',
  liters bigint NOT NULL DEFAULT 0,
  families int NOT NULL DEFAULT 0,
  note_en text NOT NULL DEFAULT '',
  note_es text NOT NULL DEFAULT '',
  latitude double precision,
  longitude double precision,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true
);

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role_en text NOT NULL DEFAULT '',
  role_es text NOT NULL DEFAULT '',
  website text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true
);

CREATE TABLE public.financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL UNIQUE,
  total_raised_cents bigint NOT NULL DEFAULT 0,
  program_cents bigint NOT NULL DEFAULT 0,
  admin_cents bigint NOT NULL DEFAULT 0,
  processing_cents bigint NOT NULL DEFAULT 0,
  liters_delivered bigint NOT NULL DEFAULT 0,
  families_served int NOT NULL DEFAULT 0,
  notes_en text NOT NULL DEFAULT '',
  notes_es text NOT NULL DEFAULT '',
  report_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  frequency text NOT NULL DEFAULT 'one_time',
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'stripe',
  provider_session_id text UNIQUE,
  provider_payment_id text,
  donor_email text,
  donor_name text,
  is_anonymous boolean NOT NULL DEFAULT false,
  dedication text,
  liters_funded bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX donations_email_idx ON public.donations (lower(donor_email));
CREATE INDEX donations_campaign_idx ON public.donations (campaign_id);
CREATE INDEX campaign_updates_campaign_idx ON public.campaign_updates (campaign_id);
CREATE INDEX campaign_media_campaign_idx ON public.campaign_media (campaign_id);
CREATE INDEX deliveries_community_idx ON public.deliveries (community_id);

-- ============ GRANTS ============
GRANT SELECT ON public.communities TO anon, authenticated;
GRANT ALL ON public.communities TO service_role;
GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
GRANT SELECT ON public.campaign_media TO anon, authenticated;
GRANT ALL ON public.campaign_media TO service_role;
GRANT SELECT ON public.campaign_updates TO anon, authenticated;
GRANT ALL ON public.campaign_updates TO service_role;
GRANT SELECT ON public.stories TO anon, authenticated;
GRANT ALL ON public.stories TO service_role;
GRANT SELECT ON public.deliveries TO anon, authenticated;
GRANT ALL ON public.deliveries TO service_role;
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT ALL ON public.partners TO service_role;
GRANT SELECT ON public.financial_reports TO anon, authenticated;
GRANT ALL ON public.financial_reports TO service_role;
GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

-- ============ RLS ============
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "published communities are public" ON public.communities FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published campaigns are public" ON public.campaigns FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published media are public" ON public.campaign_media FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published updates are public" ON public.campaign_updates FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published stories are public" ON public.stories FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published deliveries are public" ON public.deliveries FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published partners are public" ON public.partners FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "published reports are public" ON public.financial_reports FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "donors read their own donations" ON public.donations FOR SELECT TO authenticated
  USING (donor_email IS NOT NULL AND lower(donor_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ============ PUBLIC AGGREGATE ============
CREATE OR REPLACE FUNCTION public.get_crisis_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'funds_raised_cents', (
      SELECT coalesce(sum(seed_raised_cents), 0) FROM campaigns WHERE is_published
    ) + (
      SELECT coalesce(sum(amount_cents), 0) FROM donations WHERE status = 'succeeded'
    ),
    'families_supported', (SELECT coalesce(sum(families_served), 0) FROM communities WHERE is_published),
    'liters_delivered', (SELECT coalesce(sum(liters), 0) FROM deliveries WHERE is_published),
    'communities_reached', (SELECT count(*) FROM communities WHERE is_published),
    'active_campaigns', (SELECT count(*) FROM campaigns WHERE is_published AND status = 'active'),
    'donor_count', (SELECT count(DISTINCT lower(donor_email)) FROM donations WHERE status = 'succeeded'),
    'max_drought_level', (SELECT coalesce(max(drought_level), 0) FROM communities WHERE is_published),
    'avg_drought_level', (SELECT coalesce(round(avg(drought_level)::numeric, 2), 0) FROM communities WHERE is_published)
  );
$$;

REVOKE ALL ON FUNCTION public.get_crisis_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_crisis_stats() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_campaign_totals()
RETURNS TABLE (campaign_id uuid, raised_cents bigint, donor_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id,
         c.seed_raised_cents + coalesce(d.total, 0),
         coalesce(d.donors, 0)
  FROM campaigns c
  LEFT JOIN (
    SELECT campaign_id, sum(amount_cents) AS total, count(DISTINCT lower(donor_email)) AS donors
    FROM donations WHERE status = 'succeeded' GROUP BY campaign_id
  ) d ON d.campaign_id = c.id
  WHERE c.is_published;
$$;

REVOKE ALL ON FUNCTION public.get_campaign_totals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_campaign_totals() TO anon, authenticated, service_role;

-- ============ SEED ============
INSERT INTO public.communities (slug, name, region_en, region_es, latitude, longitude, drought_level, population, families_served, liters_delivered) VALUES
('san-juan', 'San Juan', 'North Coast', 'Costa Norte', 18.4655, -66.1057, 3, 342000, 1840, 2760000),
('loiza', 'Loíza', 'North East', 'Nordeste', 18.4319, -65.8801, 4, 24553, 960, 1450000),
('canovanas', 'Canóvanas', 'North East', 'Nordeste', 18.3789, -65.9017, 4, 43335, 610, 820000),
('caguas', 'Caguas', 'Central Mountains', 'Montañas Centrales', 18.2341, -66.0485, 3, 127244, 720, 1030000),
('yabucoa', 'Yabucoa', 'South East', 'Sureste', 18.0505, -65.8794, 4, 30426, 480, 640000),
('utuado', 'Utuado', 'Central Mountains', 'Montañas Centrales', 18.2680, -66.7005, 2, 28287, 350, 470000),
('ponce', 'Ponce', 'South Coast', 'Costa Sur', 18.0111, -66.6141, 3, 137491, 540, 760000),
('vieques', 'Vieques', 'Island Municipality', 'Municipio Isla', 18.1263, -65.4401, 4, 8249, 300, 390000);

INSERT INTO public.campaigns (slug, community_id, name_en, name_es, need_en, need_es, summary_en, summary_es, story_en, story_es, goal_cents, seed_raised_cents, beneficiaries, liters_per_usd, status, urgency, is_featured) VALUES
('water-for-san-juan-families',
 (SELECT id FROM public.communities WHERE slug='san-juan'),
 'Water for San Juan Families', 'Agua para las familias de San Juan',
 'Household water filters and bottled water', 'Filtros de agua domésticos y agua embotellada',
 'Rotating service cuts have left thousands of San Juan households without reliable tap water. This campaign funds household filters and emergency bottled water.',
 'Los cortes rotativos han dejado a miles de hogares de San Juan sin agua potable confiable. Esta campaña financia filtros domésticos y agua embotellada de emergencia.',
 'In the Río Piedras and Santurce sectors, service interruptions can last 24 hours or longer. Each $25 places a certified household filter that treats roughly 4,000 liters, and each $10 covers a two-day emergency supply for a family of four. Deliveries are logged by our partner brigades and published on this page within 72 hours.',
 'En los sectores de Río Piedras y Santurce, las interrupciones del servicio pueden durar 24 horas o más. Cada $25 coloca un filtro doméstico certificado que trata unos 4,000 litros, y cada $10 cubre un suministro de emergencia de dos días para una familia de cuatro. Las entregas son registradas por nuestras brigadas aliadas y publicadas en esta página en un plazo de 72 horas.',
 6000000, 3874500, 1840, 45, 'active', 'high', true),
('emergency-water-trucks-for-loiza',
 (SELECT id FROM public.communities WHERE slug='loiza'),
 'Emergency Water Trucks for Loíza', 'Camiones cisterna de emergencia para Loíza',
 'Trucked water deliveries', 'Entregas de agua en camiones cisterna',
 'Loíza sits in the most severe drought band on the island. Funding keeps water trucks running to neighborhoods with no service at all.',
 'Loíza se encuentra en la franja de sequía más severa de la isla. El financiamiento mantiene los camiones cisterna llegando a barrios sin servicio alguno.',
 'A single truck run delivers 12,000 liters to roughly 60 households in Piñones and Medianía Alta. Fuel, driver time, and sanitation checks cost about $480 per run. This campaign funds a run every other day through the dry season, with GPS-stamped delivery records for every trip.',
 'Un solo viaje de camión entrega 12,000 litros a unos 60 hogares en Piñones y Medianía Alta. El combustible, el tiempo del conductor y las inspecciones sanitarias cuestan unos $480 por viaje. Esta campaña financia un viaje cada dos días durante la temporada seca, con registros de entrega marcados por GPS en cada viaje.',
 4500000, 2915000, 960, 25, 'active', 'critical', true),
('school-water-supply-initiative',
 (SELECT id FROM public.communities WHERE slug='caguas'),
 'School Water Supply Initiative', 'Iniciativa de agua para las escuelas',
 'School filtration stations', 'Estaciones de filtración escolares',
 'When schools lose water, classes stop. This campaign installs filtration and storage at public schools so students stay in class.',
 'Cuando las escuelas se quedan sin agua, las clases se detienen. Esta campaña instala filtración y almacenamiento en escuelas públicas para que los estudiantes sigan en clase.',
 'Fourteen public schools across Caguas and Canóvanas reported closures tied to water outages last term. Each station combines a 1,000-liter tank, a multi-stage filter, and a hand-washing bank, serving about 400 students per school. Installation, plumbing, and a year of filter replacements cost $3,200 per school.',
 'Catorce escuelas públicas en Caguas y Canóvanas reportaron cierres por falta de agua el semestre pasado. Cada estación combina un tanque de 1,000 litros, un filtro de varias etapas y un lavamanos colectivo, sirviendo a unos 400 estudiantes por escuela. La instalación, la plomería y un año de reemplazo de filtros cuestan $3,200 por escuela.',
 4480000, 1612000, 5600, 60, 'active', 'medium', true),
('community-cistern-installation',
 (SELECT id FROM public.communities WHERE slug='yabucoa'),
 'Community Cistern Installation', 'Instalación de cisternas comunitarias',
 'Shared cisterns and rainwater capture', 'Cisternas compartidas y captación de lluvia',
 'Cisterns give a whole neighborhood a buffer that outlasts any single outage. This is the longest-lasting use of a donation on the platform.',
 'Las cisternas dan a todo un barrio una reserva que sobrevive cualquier corte. Es el uso más duradero de una donación en la plataforma.',
 'A 5,000-liter community cistern with a rainwater capture roof and a gravity tap serves 20 to 25 households for years, not days. Each unit costs about $2,400 installed, including the concrete pad and first-flush filtration. Yabucoa neighborhood committees choose the sites and maintain them.',
 'Una cisterna comunitaria de 5,000 litros con techo de captación de lluvia y llave por gravedad sirve de 20 a 25 hogares durante años, no días. Cada unidad cuesta unos $2,400 instalada, incluyendo la losa de concreto y la filtración de primer flujo. Los comités de barrio de Yabucoa eligen los sitios y los mantienen.',
 3600000, 940000, 480, 120, 'active', 'medium', true);

INSERT INTO public.campaign_updates (campaign_id, title_en, title_es, body_en, body_es, published_at) VALUES
((SELECT id FROM public.campaigns WHERE slug='water-for-san-juan-families'), '420 filters placed in Río Piedras', '420 filtros colocados en Río Piedras', 'Brigades completed placement in four sectors this week. Every household received a 15-minute walkthrough on cartridge replacement.', 'Las brigadas completaron la colocación en cuatro sectores esta semana. Cada hogar recibió una orientación de 15 minutos sobre el reemplazo de cartuchos.', now() - interval '4 days'),
((SELECT id FROM public.campaigns WHERE slug='water-for-san-juan-families'), 'Bottled water staged for the weekend cut', 'Agua embotellada lista para el corte del fin de semana', 'A 48-hour service interruption was announced for Santurce. We pre-positioned 9,000 liters at two community centers.', 'Se anunció una interrupción de servicio de 48 horas para Santurce. Pre-posicionamos 9,000 litros en dos centros comunitarios.', now() - interval '11 days'),
((SELECT id FROM public.campaigns WHERE slug='emergency-water-trucks-for-loiza'), 'Truck runs now every other day', 'Viajes de camión ahora cada dos días', 'With this month''s funding we moved from twice weekly to every other day. Piñones and Medianía Alta are both covered.', 'Con el financiamiento de este mes pasamos de dos veces por semana a cada dos días. Piñones y Medianía Alta están cubiertos.', now() - interval '2 days'),
((SELECT id FROM public.campaigns WHERE slug='emergency-water-trucks-for-loiza'), 'Water quality testing added to every run', 'Pruebas de calidad del agua en cada viaje', 'Each delivery now carries a chlorine residual and turbidity check, logged with the delivery record.', 'Cada entrega ahora incluye una prueba de cloro residual y turbidez, registrada con el comprobante de entrega.', now() - interval '9 days'),
((SELECT id FROM public.campaigns WHERE slug='school-water-supply-initiative'), 'First five schools online', 'Las primeras cinco escuelas en funcionamiento', 'Stations are running at five schools in Caguas, serving roughly 2,000 students daily.', 'Las estaciones funcionan en cinco escuelas de Caguas, sirviendo a unos 2,000 estudiantes al día.', now() - interval '6 days'),
((SELECT id FROM public.campaigns WHERE slug='community-cistern-installation'), 'Site selection complete in three barrios', 'Selección de sitios completada en tres barrios', 'Neighborhood committees selected three sites. Concrete pads are poured and tanks arrive next week.', 'Los comités de barrio seleccionaron tres sitios. Las losas de concreto están vaciadas y los tanques llegan la próxima semana.', now() - interval '5 days');

INSERT INTO public.deliveries (community_id, campaign_id, kind, liters, families, note_en, note_es, delivered_at) VALUES
((SELECT id FROM public.communities WHERE slug='loiza'), (SELECT id FROM public.campaigns WHERE slug='emergency-water-trucks-for-loiza'), 'truck', 12000, 60, 'Truck run to Piñones', 'Viaje de camión a Piñones', now() - interval '1 day'),
((SELECT id FROM public.communities WHERE slug='loiza'), (SELECT id FROM public.campaigns WHERE slug='emergency-water-trucks-for-loiza'), 'truck', 12000, 58, 'Truck run to Medianía Alta', 'Viaje de camión a Medianía Alta', now() - interval '3 days'),
((SELECT id FROM public.communities WHERE slug='san-juan'), (SELECT id FROM public.campaigns WHERE slug='water-for-san-juan-families'), 'filters', 168000, 420, '420 household filters placed', '420 filtros domésticos colocados', now() - interval '4 days'),
((SELECT id FROM public.communities WHERE slug='san-juan'), (SELECT id FROM public.campaigns WHERE slug='water-for-san-juan-families'), 'bottled_water', 9000, 300, 'Pre-positioned supply for service cut', 'Suministro pre-posicionado para corte de servicio', now() - interval '11 days'),
((SELECT id FROM public.communities WHERE slug='caguas'), (SELECT id FROM public.campaigns WHERE slug='school-water-supply-initiative'), 'station', 25000, 500, 'Five school filtration stations commissioned', 'Cinco estaciones escolares de filtración puestas en marcha', now() - interval '6 days'),
((SELECT id FROM public.communities WHERE slug='yabucoa'), (SELECT id FROM public.campaigns WHERE slug='community-cistern-installation'), 'cistern', 10000, 45, 'Two community cisterns filled and handed over', 'Dos cisternas comunitarias llenas y entregadas', now() - interval '8 days'),
((SELECT id FROM public.communities WHERE slug='vieques'), NULL, 'bottled_water', 7500, 250, 'Ferry-supported bottled water delivery', 'Entrega de agua embotellada apoyada por el ferry', now() - interval '13 days'),
((SELECT id FROM public.communities WHERE slug='ponce'), NULL, 'filters', 44000, 110, 'Household filters distributed in Playa sector', 'Filtros domésticos distribuidos en el sector Playa', now() - interval '16 days');

INSERT INTO public.stories (slug, campaign_id, community_id, title_en, title_es, quote_en, quote_es, body_en, body_es, author_name, author_role_en, author_role_es, published_at) VALUES
('carmen-rio-piedras', (SELECT id FROM public.campaigns WHERE slug='water-for-san-juan-families'), (SELECT id FROM public.communities WHERE slug='san-juan'),
 'The filter changed our mornings', 'El filtro cambió nuestras mañanas',
 'We used to boil everything before the kids left for school. Now the water comes out clean and we make it to the bus on time.',
 'Antes hervíamos todo antes de que los nenes salieran para la escuela. Ahora el agua sale limpia y llegamos a la guagua a tiempo.',
 'Carmen lives in Río Piedras with her three children. Her household received one of the first 420 filters placed in San Juan. She now hosts a weekly cartridge-check for four neighboring families.',
 'Carmen vive en Río Piedras con sus tres hijos. Su hogar recibió uno de los primeros 420 filtros colocados en San Juan. Ahora organiza una revisión semanal de cartuchos para cuatro familias vecinas.',
 'Carmen Rivera', 'Resident, Río Piedras', 'Residente, Río Piedras', now() - interval '5 days'),
('don-tito-pinones', (SELECT id FROM public.campaigns WHERE slug='emergency-water-trucks-for-loiza'), (SELECT id FROM public.communities WHERE slug='loiza'),
 'The truck comes and the street breathes', 'Llega el camión y la calle respira',
 'Twelve thousand liters sounds like a number until you see sixty families filling containers without arguing over who goes first.',
 'Doce mil litros suena a un número hasta que ves a sesenta familias llenando envases sin discutir quién va primero.',
 'Don Tito coordinates the container queue in Piñones and keeps the delivery log that appears on this site. He has recorded 34 truck runs since March.',
 'Don Tito coordina la fila de envases en Piñones y mantiene el registro de entregas que aparece en este sitio. Ha registrado 34 viajes de camión desde marzo.',
 'Tito Delgado', 'Neighborhood coordinator', 'Coordinador de barrio', now() - interval '7 days'),
('escuela-luis-munoz', (SELECT id FROM public.campaigns WHERE slug='school-water-supply-initiative'), (SELECT id FROM public.communities WHERE slug='caguas'),
 'No more sending students home', 'Ya no mandamos estudiantes a casa',
 'Last term we closed four days for water. Since the station went in, not one.',
 'El semestre pasado cerramos cuatro días por falta de agua. Desde que se instaló la estación, ninguno.',
 'The school serves 410 students. Its filtration station and 1,000-liter tank now cover drinking water, hand washing, and the cafeteria during outages.',
 'La escuela atiende a 410 estudiantes. Su estación de filtración y tanque de 1,000 litros ahora cubren agua potable, lavado de manos y la cafetería durante los cortes.',
 'Marisol Ortiz', 'School principal', 'Directora escolar', now() - interval '10 days'),
('cisterna-yabucoa', (SELECT id FROM public.campaigns WHERE slug='community-cistern-installation'), (SELECT id FROM public.communities WHERE slug='yabucoa'),
 'A reserve that outlasts the outage', 'Una reserva que sobrevive el corte',
 'The cistern is not a rescue. It is infrastructure we own now.',
 'La cisterna no es un rescate. Es infraestructura que ahora es nuestra.',
 'The committee in Yabucoa maintains two cisterns serving 45 households, with a rotating cleaning schedule and a shared rainwater capture roof.',
 'El comité de Yabucoa mantiene dos cisternas que sirven a 45 hogares, con un calendario rotativo de limpieza y un techo compartido de captación de lluvia.',
 'Ramón Cruz', 'Community committee lead', 'Líder del comité comunitario', now() - interval '12 days');

INSERT INTO public.partners (name, role_en, role_es, sort_order) VALUES
('Brigada Agua Loíza', 'Truck logistics and delivery verification in Loíza and Canóvanas', 'Logística de camiones y verificación de entregas en Loíza y Canóvanas', 1),
('Filtro Comunitario PR', 'Household filter sourcing, installation and cartridge replacement', 'Suministro, instalación y reemplazo de cartuchos de filtros domésticos', 2),
('Consorcio Escolar del Este', 'School site assessment and plumbing installation', 'Evaluación de escuelas e instalación de plomería', 3),
('Comité de Barrios de Yabucoa', 'Cistern site selection, construction oversight and maintenance', 'Selección de sitios, supervisión de construcción y mantenimiento de cisternas', 4),
('Vieques Mutual Aid Network', 'Ferry-supported distribution to the island municipality', 'Distribución apoyada por ferry al municipio isla', 5);

INSERT INTO public.financial_reports (period, total_raised_cents, program_cents, admin_cents, processing_cents, liters_delivered, families_served, notes_en, notes_es) VALUES
('2026-07', 3241500, 2853000, 226900, 161600, 268500, 1743, 'July was dominated by truck runs to Loíza and Canóvanas as service interruptions extended past 48 hours.', 'Julio estuvo dominado por viajes de camión a Loíza y Canóvanas mientras las interrupciones del servicio superaban las 48 horas.'),
('2026-06', 2896000, 2549000, 202700, 144300, 241000, 1512, 'June funded the first five school filtration stations in Caguas.', 'Junio financió las primeras cinco estaciones de filtración escolares en Caguas.'),
('2026-05', 2104000, 1851500, 147300, 105200, 176400, 1088, 'May opened the San Juan household filter program.', 'Mayo abrió el programa de filtros domésticos de San Juan.');