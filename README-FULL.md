# MasterSync - Crypto Trading Platform

A production-grade cryptocurrency broker and trading platform built with modern web technologies and best practices.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Library**: HeroUI (NextUI successor)
- **Styling**: Tailwind CSS v4
- **Email**: Resend + React Email
- **Security**: Cloudflare Turnstile CAPTCHA

## ✨ Features

### Authentication & Security

- Multi-step registration with email verification
- Two-factor authentication (Password + OTP)
- Global CAPTCHA integration
- Session management with HTTP-only cookies
- Row Level Security (RLS) on all database tables

### Advanced KYC Verification (100% Free & Open-Source)

- Document capture with auto-detection
- OCR data extraction (Tesseract.js)
- Liveness detection (face-api.js)
- Face matching (document vs selfie)
- Automated verification scoring
- Admin review interface with detailed analytics

### Admin Control Panel

- User management dashboard
- KYC verification queue with scores
- Detailed verification review modal
- Approve/reject with notes
- Email notifications on status changes
- Admin login alerts

### User Dashboard

- Portfolio overview
- Account management
- KYC status tracking
- Holdings display
- Trading interface (placeholder)

## 📋 Prerequisites for Collaborators

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- Access to project environment variables (ask project lead)

## 🛠️ Quick Start for Collaborators

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mastersync
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Variables

Create `.env.local` file and **ask the project lead** for the credentials:

```env
# Supabase (ask project lead)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (ask project lead)
RESEND_API_KEY=

# Cloudflare Turnstile (ask project lead)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Download Face Detection Models

```bash
# Create models directory
mkdir -p public/models

# Download face-api.js models (required for KYC)
cd public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
cd ../..
```

### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test Accounts

Ask the project lead for test credentials:
- **User account**: Test the full user flow
- **Admin account**: Access cPanel at `/cpanel`

---

## 🔧 Initial Project Setup (Already Completed)

<details>
<summary>Click to expand - For reference only, setup is already done</summary>

### Database Setup
All migrations have been run in Supabase:
- `001_initial_schema.sql` - Core tables
- `002_advanced_kyc.sql` - KYC verification tables  
- `003_add_otp_metadata.sql` - OTP metadata
- `004_fix_profiles_rls.sql` - RLS policy fixes
- `005_add_admin_notes.sql` - Admin notes column
- `006_add_kyc_foreign_keys.sql` - Foreign key relationships

### Storage Bucket
- Bucket: `kyc-documents` (private)
- RLS policies configured for user uploads and admin access

### Third-Party Services
- **Supabase**: Database, Auth, Storage
- **Resend**: Email service  
- **Cloudflare Turnstile**: CAPTCHA

</details>

---

## 📋 Prerequisites for Initial Setup

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- Supabase account
- Resend account (for emails)
- Cloudflare Turnstile site key (for CAPTCHA)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mastersync
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Supabase

### 4. Configure Storage Policies

### 5. Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (Email)
RESEND_API_KEY=re_your_api_key

# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your keys:**

- Supabase: Project Settings → API
- Resend: [resend.com/api-keys](https://resend.com/api-keys)
- Turnstile: [Cloudflare Dashboard](https://dash.cloudflare.com/)

### 6. Download Face Detection Models

```bash
# Create models directory
mkdir -p public/models

# Download face-api.js models (required for KYC)
cd public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
cd ../..
```

### 7. Create Admin User

1. Register a user at `/register`
2. Run this in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 8. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── actions/              # Server actions
│   ├── auth.ts          # Authentication
│   ├── kyc.ts           # KYC verification
│   └── admin.ts         # Admin operations
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── cpanel/          # Admin control panel
│   │   ├── page.tsx     # Admin login
│   │   └── (organization)/
│   │       ├── admin/   # Dashboard
│   │       ├── users/   # User management
│   │       └── kyc-pending/  # KYC queue
│   ├── dashboard/       # User dashboard
│   └── onboarding/      # KYC flow
├── components/
│   ├── admin/           # Admin components
│   └── dashboard/       # Dashboard components
├── emails/              # Email templates
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── ocr/             # Document extraction
│   └── email.ts         # Email utilities
└── middleware.ts        # Route protection
```

## 🔐 Security Features

- **Row Level Security (RLS)**: All tables protected at database level
- **HTTP-only Cookies**: Secure session management
- **CAPTCHA**: Bot protection on auth pages
- **Server-side Validation**: Zod schemas for all inputs
- **Admin Role Checks**: Enforced in middleware and database
- **Signed URLs**: Temporary access to private files
- **Email Notifications**: Admin login alerts

## 🧪 Testing

### Test User Flow

1. Register at `/register`
2. Verify email with OTP
3. Complete profile
4. Submit KYC verification
5. Check status at `/onboarding/kyc-advanced`

### Test Admin Flow

1. Login at `/cpanel`
2. View KYC queue at `/cpanel/kyc-pending`
3. Click "View Details" on submission
4. Approve or reject with notes
5. User receives email notification

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Update Supabase redirect URLs:
   - Go to Authentication → URL Configuration
   - Add your production URL

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📝 Database Schema

### Core Tables

- `profiles` - User profiles (extends auth.users)
- `otp_codes` - Email verification codes
- `balances` - User crypto balances
- `trades` - Trading history

### KYC Tables

- `kyc_verification_results` - Verification scores and status
- `kyc_document_data` - Extracted OCR data
- `kyc_liveness_checks` - Liveness detection results
- `kyc_face_matches` - Face matching scores
- `kyc_submissions` - Document file paths

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add comments for complex logic
- Use server actions for mutations
- Implement proper error handling

## 🐛 Troubleshooting

### "Invalid JWT" errors

- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Clear cookies and re-login

### Storage upload fails

- Check bucket exists: `kyc-documents`
- Verify RLS policies on `storage.objects`
- Ensure user is authenticated

### Admin can't access cPanel

- Verify role is 'admin' in profiles table
- Clear session and re-login

### KYC verification not showing

- Check all migrations are run
- Verify foreign key constraints exist
- Check browser console for errors

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [HeroUI Docs](https://heroui.com)
- [Resend Docs](https://resend.com/docs)

## 📄 License

MIT

## 🙏 Acknowledgments

- Face detection: [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- OCR: [Tesseract.js](https://github.com/naptha/tesseract.js)
- UI Components: [HeroUI](https://heroui.com)
- Backend: [Supabase](https://supabase.com)

---

**Built with ❤️ for secure and compliant crypto trading**
