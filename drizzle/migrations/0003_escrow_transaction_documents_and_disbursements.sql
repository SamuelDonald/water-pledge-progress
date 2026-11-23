CREATE TABLE public.transaction_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transaction_documents TO authenticated;
GRANT ALL ON public.transaction_documents TO service_role;
ALTER TABLE public.transaction_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents read scoped" ON public.transaction_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.escrow_transactions t
    WHERE t.id = transaction_id
      AND (t.realtor_id = auth.uid() OR t.buyer_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'escrow_officer'))
  ));
CREATE INDEX transaction_documents_transaction_id_idx ON public.transaction_documents (transaction_id);

CREATE TABLE public.disbursement_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.escrow_transactions(id) ON DELETE CASCADE,
  release_request_id uuid NOT NULL UNIQUE REFERENCES public.release_requests(id) ON DELETE RESTRICT,
  recorded_by uuid NOT NULL,
  recipient_name text NOT NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  reference text NOT NULL,
  notes text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disbursement_records TO authenticated;
GRANT ALL ON public.disbursement_records TO service_role;
ALTER TABLE public.disbursement_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disbursements read scoped" ON public.disbursement_records FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.escrow_transactions t
    WHERE t.id = transaction_id
      AND (t.realtor_id = auth.uid() OR t.buyer_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'escrow_officer'))
  ));
CREATE INDEX disbursement_records_transaction_id_idx ON public.disbursement_records (transaction_id);

CREATE OR REPLACE FUNCTION public.handle_new_escrow_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
COMMENT ON TABLE public.profiles IS 'DEPRECATED: Liberty Crest uses account-only sign-in and does not collect profile records.';