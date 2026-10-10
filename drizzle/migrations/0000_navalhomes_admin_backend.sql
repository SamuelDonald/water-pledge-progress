create table if not exists public.properties(
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  location text not null, city text not null default '',
  status text not null default 'For Sale', property_type text not null default 'House',
  price numeric(14,2) not null default 0, bedrooms integer not null default 0,
  bathrooms numeric(4,1) not null default 0, sqft integer not null default 0, lot_size numeric(10,3),
  description text not null default '', neighborhood text, address text, latitude double precision, longitude double precision,
  is_featured boolean not null default false, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.properties add column if not exists opportunity_type text default 'direct_purchase';
alter table public.properties add column if not exists opportunity_summary text;
alter table public.properties add column if not exists seller_or_contract_holder_label text;
alter table public.properties add column if not exists contract_rights_verified boolean not null default false;
alter table public.properties add column if not exists written_disclosures_verified boolean not null default false;

create table if not exists public.property_media(
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
  media_type text not null default 'image', url text not null default '', storage_path text, caption text,
  sort_order integer not null default 0, created_at timestamptz not null default now()
);
alter table public.property_media add column if not exists storage_path text;

create table if not exists public.inquiries(
  id uuid primary key default gen_random_uuid(), property_id uuid references public.properties(id) on delete set null,
  name text not null, phone text not null, email text not null, message text not null,
  allow_phone boolean not null default false, allow_sms boolean not null default false,
  allow_whatsapp boolean not null default false, created_at timestamptz not null default now()
);
alter table public.inquiries add column if not exists status text not null default 'new';
alter table public.inquiries add column if not exists admin_notes text not null default '';

grant select on public.properties, public.property_media to anon, authenticated;
grant all on public.properties, public.property_media, public.inquiries to service_role;

alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "published properties are public" on public.properties;
create policy "published properties are public" on public.properties for select to anon,authenticated using(is_published=true);
drop policy if exists "published property media are public" on public.property_media;
create policy "published property media are public" on public.property_media for select to anon,authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.is_published=true));

create index if not exists properties_published_idx on public.properties(is_published, location);
create index if not exists property_media_property_idx on public.property_media(property_id, sort_order);
create index if not exists inquiries_created_idx on public.inquiries(created_at desc);

create or replace function public.set_navalhomes_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties for each row execute function public.set_navalhomes_updated_at();