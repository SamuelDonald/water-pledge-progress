create extension if not exists pgcrypto;
create table if not exists public.properties(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,location text not null check(location in ('Dallas','Houston','Rio Grande Valley')),city text not null,status text not null default 'For Sale' check(status in ('For Sale','For Rent','Sold','Rented')),property_type text not null check(property_type in ('House','Condo','Apartment')),price numeric(14,2) not null default 0,bedrooms integer not null default 0,bathrooms numeric(4,1) not null default 0,sqft integer not null default 0,lot_size numeric(8,3),description text not null default '',neighborhood text,address text,latitude double precision,longitude double precision,is_featured boolean not null default false,is_published boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.property_media(id uuid primary key default gen_random_uuid(),property_id uuid not null references public.properties(id) on delete cascade,media_type text not null check(media_type in ('image','video')),url text not null,caption text,sort_order integer not null default 0,created_at timestamptz not null default now());
create table if not exists public.inquiries(id uuid primary key default gen_random_uuid(),property_id uuid references public.properties(id) on delete set null,name text not null,phone text not null,email text not null,message text not null,allow_phone boolean not null default false,allow_sms boolean not null default false,allow_whatsapp boolean not null default false,created_at timestamptz not null default now());
alter table public.properties enable row level security; alter table public.property_media enable row level security; alter table public.inquiries enable row level security;
create policy "published properties are public" on public.properties for select to anon,authenticated using(is_published=true);
create policy "published property media are public" on public.property_media for select to anon,authenticated using(exists(select 1 from public.properties p where p.id=property_id and p.is_published=true));
create policy "public can submit inquiries" on public.inquiries for insert to anon,authenticated with check(true);
insert into public.properties(slug,title,location,city,status,property_type,price,bedrooms,bathrooms,sqft,lot_size,description,neighborhood,is_featured,is_published) values
('oak-estate','The Oak Estate','Dallas','Dallas','For Sale','House',1895000,5,5,4860,.42,'A refined private residence defined by generous proportions, natural light and quiet architectural detail.','Preston Hollow',true,true),
('memorial-residence','Memorial Residence','Houston','Houston','For Sale','House',1425000,4,4,3820,.31,'Contemporary Houston living with expansive interiors, curated finishes and an effortless indoor-outdoor flow.','Memorial',true,true),
('rio-grande-modern','Rio Grande Modern','Rio Grande Valley','McAllen','For Rent','Condo',4200,3,3,2140,null,'A polished modern home in the Rio Grande Valley, designed for relaxed living and entertaining.','Sharyland',true,true)
on conflict(slug) do nothing;
insert into storage.buckets(id,name,public) values('property-media','property-media',true) on conflict(id) do nothing;
create policy "public property media read" on storage.objects for select to public using(bucket_id='property-media');

create table if not exists public.admin_users(email text primary key);
alter table public.admin_users enable row level security;
create or replace function public.is_navalhomes_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where lower(email)=lower(coalesce(auth.jwt()->>'email',''))); $$;
create policy "admins manage properties" on public.properties for all to authenticated using(public.is_navalhomes_admin()) with check(public.is_navalhomes_admin());
create policy "admins manage property media" on public.property_media for all to authenticated using(public.is_navalhomes_admin()) with check(public.is_navalhomes_admin());
create policy "admins read inquiries" on public.inquiries for select to authenticated using(public.is_navalhomes_admin());
