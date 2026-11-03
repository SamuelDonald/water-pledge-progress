create table if not exists public.property_submissions (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null,
 location text not null check(location in ('Dallas','Houston','Rio Grande Valley')), city text not null,
 property_type text not null, listing_status text not null default 'For Sale',
 asking_price numeric(14,2) not null default 0, bedrooms integer not null default 0,
 bathrooms numeric(4,1) not null default 0, sqft integer not null default 0, lot_size numeric(10,3),
 description text not null default '', neighborhood text, address text,
 seller_name text not null, seller_phone text not null, seller_email text not null, seller_role text not null,
 preferred_contact_method text not null default 'email' check(preferred_contact_method in ('email','phone')),
 whatsapp_available boolean not null default false,
 media_paths jsonb not null default '[]'::jsonb, has_contract_rights boolean not null default false,
 contract_type text, contract_price numeric(14,2), contract_status text, contract_notes text, contract_document_path text,
 authorization_confirmed boolean not null default false,
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected','changes_requested')),
 admin_notes text, reviewed_at timestamptz, created_property_id uuid references public.properties(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
revoke all on public.property_submissions from anon, authenticated;
grant all on public.property_submissions to service_role;
alter table public.property_submissions enable row level security;
create index if not exists property_submissions_created_idx on public.property_submissions(created_at desc);

alter table public.properties add column if not exists opportunity_type text not null default 'direct_purchase';
alter table public.properties add column if not exists contract_rights_verified boolean not null default false;
alter table public.properties add column if not exists written_disclosures_verified boolean not null default false;
alter table public.properties add column if not exists opportunity_summary text;
alter table public.properties add column if not exists seller_or_contract_holder_label text;

create or replace function public.set_property_submissions_updated_at()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists property_submissions_updated_at on public.property_submissions;
create trigger property_submissions_updated_at before update on public.property_submissions
 for each row execute function public.set_property_submissions_updated_at();

create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  home_type text not null, price_range text not null, intended_use text not null,
  military_status text not null, military_branch text, down_payment_range text not null,
  buying_journey text not null, credit_score_range text, employment_situation text, annual_income_range text,
  timeline text not null, opportunity_path text not null,
  preferred_markets text[] not null default '{}', preferred_city text, preferred_area text, additional_notes text,
  contact_name text not null, contact_email text not null, contact_phone text not null,
  contact_consent boolean not null default false,
  status text not null default 'new' check (status in ('new','reviewing','contacted','matched','closed')),
  admin_notes text not null default '', assigned_to text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
revoke all on public.buyer_requests from anon, authenticated;
grant all on public.buyer_requests to service_role;
alter table public.buyer_requests enable row level security;
drop trigger if exists buyer_requests_updated_at on public.buyer_requests;
create trigger buyer_requests_updated_at before update on public.buyer_requests
 for each row execute function public.set_property_submissions_updated_at();