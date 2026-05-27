-- Add logo_url column to existing wallets table
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add wallet_id foreign key to deposits if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deposits' AND column_name = 'wallet_id'
  ) THEN
    ALTER TABLE public.deposits ADD COLUMN wallet_id UUID REFERENCES public.wallets(id);
  END IF;
END $$;

-- Create storage bucket for wallet logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('wallet-logos', 'wallet-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for wallet logos (public read, admin write)
CREATE POLICY "Anyone can view wallet logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wallet-logos');

CREATE POLICY "Admins can upload wallet logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'wallet-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update wallet logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'wallet-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete wallet logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'wallet-logos' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
