-- Add quantity column to placas_solares table
ALTER TABLE public.placas_solares
ADD COLUMN quantidade integer DEFAULT 0;