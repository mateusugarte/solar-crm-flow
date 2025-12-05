-- Add proposal-related columns to usuarios table
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS valor_proposta text,
ADD COLUMN IF NOT EXISTS forma_pagamento text,
ADD COLUMN IF NOT EXISTS produto_proposta text,
ADD COLUMN IF NOT EXISTS prazo_instalacao text,
ADD COLUMN IF NOT EXISTS info_proposta text,
ADD COLUMN IF NOT EXISTS motivo_rejeicao text,
ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for proposal PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('propostas', 'propostas', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload
CREATE POLICY "Allow authenticated uploads to propostas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'propostas');

-- Create storage policy for public read access
CREATE POLICY "Allow public read access to propostas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'propostas');

-- Create storage policy for authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes from propostas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'propostas');