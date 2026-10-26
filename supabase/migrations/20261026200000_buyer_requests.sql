-- Buyer request intake replaces public home browsing while preserving seller submissions.
create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  home_type text not null,
  price_range text not null,
  intended_use text not null,
  military_status text not null,
  military_branch text,
  down_payment_range text not null,
  buying_journey text not null,
  credit_score_range text,
  employment_situation text,
  annual_income_range text,
  timeline text not null,
  opportunity_path text not null,
  preferred_markets text[] not null default '{}',
  preferred_city text,
  preferred_area text,
  additional_notes text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_consent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'reviewing', 'contacted', 'matched', 'closed')),
  admin_notes text not null default '',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_requests_valid_markets check (
    preferred_markets <@ array['Dallas', 'Houston', 'Rio Grande Valley']::text[]
    and cardinality(preferred_markets) between 1 and 3
  ),
  constraint buyer_requests_consent check (contact_consent = true)
);

create index if not exists buyer_requests_status_created_idx on public.buyer_requests (status, created_at desc);
create index if not exists buyer_requests_created_idx on public.buyer_requests (created_at desc);

alter table public.buyer_requests enable row level security;
-- No anon/authenticated policies: all inserts and reads go through server functions using the service role.
revoke all on public.buyer_requests from anon, authenticated;
grant all on public.buyer_requests to service_role;

create or replace function public.set_buyer_requests_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists buyer_requests_updated_at on public.buyer_requests;
create trigger buyer_requests_updated_at before update on public.buyer_requests
for each row execute function public.set_buyer_requests_updated_at();
