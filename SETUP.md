# MasterSync Setup Checklist

## ✅ Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `mastersync`
4. Set a strong database password (save it!)
5. Choose your region
6. Wait ~2 minutes for provisioning

## ✅ Step 2: Run Database Migration
1. In Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. ✅ You should see "Success. No rows returned"

## ✅ Step 3: Create Storage Bucket
1. Go to Storage → "New bucket"
2. Name: `kyc-documents`
3. **Make it Private** (uncheck "Public bucket")
4. Click "Create bucket"

## ✅ Step 4: Add Storage Policies
1. Go to Storage → `kyc-documents` → Policies
2. Click "New Policy" → "For full customization"
3. Run this SQL in SQL Editor:

```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own KYC docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read own files
CREATE POLICY "Users can read own KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to read all
CREATE POLICY "Admins can read all KYC docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## ✅ Step 5: Get API Keys
1. Go to Settings → API
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (⚠️ KEEP SECRET!)
```

## ✅ Step 6: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY="re_..." # Optional
```

## ✅ Step 7: Start Development Server
```bash
pnpm dev
```

Visit: http://localhost:3000

## ✅ Step 8: Create Admin User
1. Go to http://localhost:3000/register
2. Register with:
   - Email: `admin@mastersync.com`
   - Fill in other details
   - Create password

3. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@mastersync.com';
```

4. Logout and login again
5. Access admin panel at http://localhost:3000/admin

## 🎉 You're Done!

Test the following:
- ✅ Register a new user
- ✅ Login with credentials
- ✅ Upload KYC document in /dashboard/account
- ✅ Login as admin at /admin/login
- ✅ Review KYC in /admin/kyc-pending
- ✅ Approve/reject KYC
- ✅ Toggle dark/light theme

## 🐛 Troubleshooting

**"relation 'profiles' does not exist"**
→ Re-run the migration SQL

**"storage bucket not found"**
→ Create bucket named exactly `kyc-documents`

**Upload fails**
→ Check storage policies are added

**Admin can't access /admin**
→ Run the UPDATE query to set role = 'admin'

**"Invalid JWT"**
→ Check NEXT_PUBLIC_SUPABASE_ANON_KEY is correct

## 📚 Next Steps

1. Customize theme colors in `tailwind.config.ts`
2. Add TradingView chart widget to `/dashboard/trading`
3. Implement deposit/withdrawal logic
4. Add staking pools
5. Deploy to Vercel
6. Update Supabase redirect URLs for production

## 🚀 Production Deployment

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Add all environment variables
4. Deploy

### Update Supabase for Production
1. Authentication → URL Configuration
2. Site URL: `https://your-domain.com`
3. Redirect URLs: `https://your-domain.com/**`

---

Need help? Check:
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
