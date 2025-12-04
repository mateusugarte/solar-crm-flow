-- Add status column to placas_solares table
ALTER TABLE public.placas_solares
ADD COLUMN status text DEFAULT 'disponivel';

-- Update existing rows to have default status
UPDATE public.placas_solares SET status = 'disponivel' WHERE status IS NULL;