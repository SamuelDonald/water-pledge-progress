CREATE TYPE public.app_role AS ENUM ('admin','realtor','buyer','escrow_officer');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text, full_name text, phone text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_escrow_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_escrow AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_escrow_user();

CREATE TABLE public.realtor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL, brokerage text NOT NULL, license_number text NOT NULL,
  phone text, markets text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  reviewed_by uuid, reviewed_at timestamptz, review_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.realtor_applications TO authenticated;
GRANT ALL ON public.realtor_applications TO service_role;
ALTER TABLE public.realtor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps read" ON public.realtor_applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "apps insert own" ON public.realtor_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE TABLE public.escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('LC-' || upper(substr(md5(random()::text),1,8))),
  realtor_id uuid NOT NULL,
  buyer_id uuid,
  buyer_email text NOT NULL,
  property_address text NOT NULL, city text NOT NULL, state text NOT NULL DEFAULT 'TX', zip text,
  transaction_type text NOT NULL DEFAULT 'earnest_money',
  deposit_amount_cents bigint NOT NULL CHECK (deposit_amount_cents > 0),
  currency text NOT NULL DEFAULT 'USD',
  payment_deadline date,
  release_conditions text, refund_conditions text,
  status text NOT NULL DEFAULT 'invitation_sent',
  buyer_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.escrow_transactions TO authenticated;
GRANT ALL ON public.escrow_transactions TO service_role;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tx read scoped" ON public.escrow_transactions FOR SELECT TO authenticated
  USING (realtor_id = auth.uid() OR buyer_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'escrow_officer'));

CREATE TABLE public.transaction_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.transaction_invitations TO service_role;
ALTER TABLE public.transaction_invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('wire','crypto')),
  status text NOT NULL DEFAULT 'instructions_pending',
  amount_cents bigint NOT NULL,
  buyer_reference text,
  submitted_by uuid,
  verified_by uuid, verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_records TO authenticated;
GRANT ALL ON public.payment_records TO service_role;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments read scoped" ON public.payment_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.escrow_transactions t WHERE t.id = transaction_id AND (t.realtor_id = auth.uid() OR t.buyer_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'escrow_officer'))));

CREATE TABLE public.release_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by uuid, decided_at timestamptz, decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.release_requests TO authenticated;
GRANT ALL ON public.release_requests TO service_role;
ALTER TABLE public.release_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "release read scoped" ON public.release_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.escrow_transactions t WHERE t.id = transaction_id AND (t.realtor_id = auth.uid() OR t.buyer_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'escrow_officer'))));

CREATE TABLE public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid,
  actor_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_events TO authenticated;
GRANT ALL ON public.audit_events TO service_role;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit read scoped" ON public.audit_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.escrow_transactions t WHERE t.id = transaction_id AND (t.realtor_id = auth.uid() OR t.buyer_id = auth.uid())));

CREATE INDEX ON public.escrow_transactions (realtor_id);
CREATE INDEX ON public.escrow_transactions (buyer_id);
CREATE INDEX ON public.payment_records (transaction_id);
CREATE INDEX ON public.release_requests (transaction_id);
CREATE INDEX ON public.audit_events (transaction_id);