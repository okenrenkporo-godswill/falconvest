# MasterSync - Crypto Trading Platform

A production-grade crypto broker/trading platform built with Next.js 15, TypeScript, Supabase, and modern fintech best practices.

## Features

- **Authentication**: Supabase Auth with email/password
- **KYC Verification**: Document upload via Supabase Storage with admin review
- **User Dashboard**: Portfolio overview, trading, holdings, staking, copy trading
- **Admin Panel**: User management, KYC approval queue
- **Theme Support**: Full light/dark mode with system preference detection
- **Security**: Supabase Row Level Security (RLS), secure storage policies

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Library**: HeroUI (NextUI successor)
- **Styling**: Tailwind CSS v4
- **Email**: Resend.com (optional - Supabase handles auth emails)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project
- Resend API key (optional)

### Installation

1. **Clone and install**:
```bash
git clone <repo-url>
cd mastersync
npm install
```

2. **Set up Supabase**:

Create a new Supabase project at https://supabase.com

3. **Run database migrations**:

In your Supabase project dashboard, go to SQL Editor and run the migration file:
```
supabase/migrations/001_initial_schema.sql
```

This creates:
- `profiles` table (extends auth.users)
- `kyc_submissions` table
- `balances` table
- `trades` table
- Row Level Security policies
- Trigger to auto-create profile on signup

4. **Create Storage bucket**:

In Supabase Dashboard → Storage:
- Create bucket: `kyc-documents`
- Make it private
- Add policy:
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

5. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase project settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase project settings → API (keep secret!)
- `RESEND_API_KEY`: Optional, for custom emails

6. **Create admin user**:

Sign up via the app at `/register` with email `admin@mastersync.com`, then run in Supabase SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@mastersync.com';
```

7. **Start development server**:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
src/
├── actions/
│   ├── auth.ts               # Auth server actions
│   ├── kyc.ts                # KYC server actions
│   └── admin.ts              # Admin server actions
├── app/
│   ├── admin/                # Admin panel routes
│   ├── dashboard/            # User dashboard routes
│   ├── login/                # Auth pages
│   └── register/
├── components/
│   ├── dashboard/            # Dashboard components
│   ├── admin/                # Admin components
│   └── providers.tsx         # HeroUI + theme providers
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser client
│       ├── server.ts         # Server client
│       └── middleware.ts     # Auth middleware helper
├── middleware.ts             # Route protection
└── env.ts                    # Type-safe env vars
```

## Key Flows

### User Registration
1. Fill registration form → Supabase signUp
2. Profile auto-created via database trigger
3. Redirect to dashboard
4. Upload KYC documents → pending review

### Login Flow
1. Enter email + password → Supabase signInWithPassword
2. Session created → redirect to dashboard

### KYC Verification
1. User uploads government ID to Supabase Storage
2. File path stored in `kyc_submissions` table
3. Admin reviews in `/admin/kyc-pending`
4. Admin approves/rejects with optional reason
5. User sees status in account page

## Admin Access

- Login at `/admin/login` with admin account
- Default: `admin@mastersync.com` (set role via SQL after signup)

## Database Schema

### Tables
- `profiles`: User profiles (extends auth.users)
- `kyc_submissions`: KYC document uploads
- `balances`: User crypto balances (mock)
- `trades`: Trading history (mock)

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only read/write their own data
- Admins can read/write all data
- Enforced at database level (critical for security)

## Security Best Practices

✅ **Implemented:**
- Row Level Security on all tables
- Supabase Auth session management
- HTTP-only cookies via Supabase SSR
- Server-side validation with Zod
- Secure file uploads with user-scoped paths
- Admin role checks at database level

⚠️ **TODO:**
- Rate limiting on auth endpoints (use Supabase Edge Functions)
- 2FA/TOTP support
- Password strength meter (zxcvbn)
- Audit logs

## Supabase Integration Details

### Authentication
- Uses `@supabase/ssr` for Next.js App Router
- Server client: `createClient()` from `lib/supabase/server.ts`
- Browser client: `createClient()` from `lib/supabase/client.ts`
- Middleware: Automatic session refresh + route protection

### Storage
- Bucket: `kyc-documents` (private)
- User uploads to: `{user_id}/{timestamp}-{filename}`
- Signed URLs for admin review (1-hour expiry)

### Realtime (Future)
- Can subscribe to balance updates
- Live notifications
- Order book updates

## Customization

### Theme Colors
Edit `tailwind.config.ts`:
```ts
heroui({
  themes: {
    light: { colors: { primary: "#your-color" } },
    dark: { colors: { primary: "#your-color" } }
  }
})
```

### Add More Tables
1. Create migration in Supabase SQL Editor
2. Add RLS policies
3. Create server actions in `src/actions/`
4. Add UI components

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Update Supabase redirect URLs in project settings

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## TODO / Roadmap

- [ ] Implement actual trading engine integration
- [ ] Add TradingView chart widget
- [ ] Crypto deposit/withdrawal functionality
- [ ] Staking pools implementation
- [ ] Copy trading system
- [ ] 2FA/TOTP support (Supabase supports this)
- [ ] Rate limiting via Supabase Edge Functions
- [ ] Password strength meter
- [ ] Admin audit logs
- [ ] Realtime balance updates
- [ ] Push notifications

## Troubleshooting

### "Invalid JWT" errors
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify middleware is properly configured
- Clear cookies and re-login

### Storage upload fails
- Verify bucket exists and is named `kyc-documents`
- Check RLS policies on `storage.objects`
- Ensure user is authenticated

### Admin can't access admin panel
- Verify role is set to 'admin' in profiles table
- Check RLS policies allow admin access
- Clear session and re-login

## Support

For issues or questions:
- Supabase docs: https://supabase.com/docs
- GitHub issues: <your-repo>

## License

MIT
