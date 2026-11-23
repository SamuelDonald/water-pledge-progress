CREATE POLICY "escrow documents restrict direct authenticated storage access"
ON storage.objects AS RESTRICTIVE
FOR ALL TO authenticated
USING (bucket_id <> 'escrow-transaction-documents')
WITH CHECK (bucket_id <> 'escrow-transaction-documents');