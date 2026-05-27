-- Make proof_path optional in deposits table
ALTER TABLE public.deposits ALTER COLUMN proof_path DROP NOT NULL;
