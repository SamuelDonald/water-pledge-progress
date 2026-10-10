create table if not exists public.property_submissions (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null,
 location text not null check(location in ('Dallas','Houston','Rio Grande Valley')), city text not null,
 property_type text not null, listing_status text not null default 'For Sale',
 asking_price numeric(14,2) not null default 0, bedrooms integer not null default 0,
 bathrooms numeric(4,1) not null default 0, sqft integer not null default 0, lot_size numeric(10,3),
 description text not null default '', neighborhood text, address text,
 seller_name text not null, seller_phone text not null, seller_email text not null, seller_role text not null,
 media_paths jsonb not null default '[]'::jsonb, has_contract_rights boolean not null default false,
 contract_type text, contract_price numeric(14,2), contract_status text, contract_notes text, contract_document_path text,
 authorization_confirmed boolean not null default false,
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected','changes_requested')),
 admin_notes text, reviewed_at timestamptz, created_property_id uuid references public.properties(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.property_submissions enable row level security;
drop policy if exists "public submit property intake" on public.property_submissions;
create policy "public submit property intake" on public.property_submissions for insert to anon,authenticated
 with check(review_status='pending' and created_property_id is null and authorization_confirmed=true);
drop policy if exists "admins manage property intake" on public.property_submissions;
create policy "admins manage property intake" on public.property_submissions for all to authenticated
 using(public.is_navalhomes_admin()) with check(public.is_navalhomes_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('property-submissions','property-submissions',false,52428800,
 array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=52428800;
drop policy if exists "public upload property intake media" on storage.objects;
create policy "public upload property intake media" on storage.objects for insert to anon,authenticated
 with check(bucket_id='property-submissions');
drop policy if exists "admins read property intake media" on storage.objects;
create policy "admins read property intake media" on storage.objects for select to authenticated
 using(bucket_id='property-submissions' and public.is_navalhomes_admin());
drop policy if exists "admins delete property intake media" on storage.objects;
create policy "admins delete property intake media" on storage.objects for delete to authenticated
 using(bucket_id='property-submissions' and public.is_navalhomes_admin());

alter table public.properties add column if not exists opportunity_type text not null default 'direct_purchase';
alter table public.properties add column if not exists contract_rights_verified boolean not null default false;
alter table public.properties add column if not exists written_disclosures_verified boolean not null default false;
alter table public.properties add column if not exists opportunity_summary text;
alter table public.properties add column if not exists seller_or_contract_holder_label text;
alter table public.properties drop constraint if exists properties_property_type_check;
alter table public.properties add constraint properties_property_type_check
 check(property_type in ('House','Condo','Apartment','Multi-family','Land','Commercial','Mixed-use','Other'));
drop trigger if exists property_submissions_updated_at on public.property_submissions;
create trigger property_submissions_updated_at before update on public.property_submissions
 for each row execute function public.set_navalhomes_updated_at();
