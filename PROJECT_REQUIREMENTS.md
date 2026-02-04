# MasterSync - Project Requirements

## Overview
MasterSync is a production-grade crypto broker/trading platform built with Next.js 15, TypeScript, Supabase, and HeroUI.

## Core Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router, Server Actions, React Server Components)
- **Language**: TypeScript (strict mode, no any)
- **UI Library**: HeroUI (@heroui/react) - latest version compatible with Tailwind CSS v3
- **Styling**: Tailwind CSS v3 + HeroUI's Tailwind plugin for theming
- **Theme**: Full light/dark mode support (system preference + manual toggle, persisted)

### Backend
- **Primary Backend**: Supabase
  - **Auth**: Email + Password + OTP for login/registration
  - **Database**: Postgres with Row Level Security (RLS)
  - **Storage**: KYC document uploads with signed URLs
  - **Realtime**: Optional for live updates (future)
- **Email Service**: Resend.com (custom OTP, welcome emails, password reset)
- **Image Processing**: ImageKit.io (optional for advanced transformations)

### Security Requirements
- Row Level Security (RLS) enabled on all tables
- User-owned data enforcement
- Service role key never exposed client-side
- Rate limiting on OTP/resends
- Input validation with Zod
- Signed URLs for file access

## Pages & Features

### Public Pages (No Auth)
- **/** - Home page with hero, trust signals, CTAs
- **/terms** - Terms & Conditions
- **/privacy** - Privacy Policy

### Authentication Flows
- **/login** - Email + Password → OTP verification → Dashboard
  - 6-digit OTP, 5-min expiry, resend with cooldown
- **/register** - Multi-step onboarding:
  1. Email input
  2. OTP verification
  3. Complete profile (name, username, phone, country, state, city, address, password)
  4. Account created → Mandatory KYC
- **/forgot-password** - Password reset via email
- **/reset-password** - Set new password with token

### Protected User Dashboard (/dashboard/*)
**Layout**: Collapsible sidebar + topbar
- **Sidebar**: Home, Account, Deposit, Withdrawal, Trading, Holdings, Staking, Copy Trading
- **Topbar**: Theme toggle, notifications, profile dropdown (logout, settings)

**Sub-pages**:
- **/dashboard** - Overview: portfolio value, PNL chart, recent trades, quick actions
- **/dashboard/account** - Profile view/edit, security, KYC status + upload
- **/dashboard/deposit** - Deposit addresses, history table
- **/dashboard/withdrawal** - Withdrawal form with OTP confirmation, history
- **/dashboard/trading** - Trading terminal:
  - TradingView advanced chart widget
  - Mock order book / recent trades
  - Buy/Sell form (limit/market orders)
- **/dashboard/holdings** - User balances table, allocation chart
- **/dashboard/staking** - Staking pools, user stakes/rewards
- **/dashboard/copy-trading** - Top traders list, follow functionality

### KYC Flow (Mandatory)
1. Post-registration → Redirect to KYC upload
2. Upload government-issued ID (front/back) to Supabase Storage
3. Store file paths + status in `kyc_submissions` table
4. Status: pending → auto_verified / manually_verified / rejected
5. Block dashboard access until KYC approved
6. Admin reviews via signed URLs

### Admin Area (/admin/*)
**Protected by role check**: `profiles.role = 'admin'`

- **/admin/login** - Admin login (same Supabase Auth + role check)
- **/admin** - Stats overview (user count, pending KYC)
- **/admin/users** - Paginated user table (search/filter by KYC status)
- **/admin/kyc-pending** - Queue of pending KYC uploads with preview
  - Approve/reject with reason
  - View signed URLs for documents

**Default Admin**:
- Email: admin@mastersync.com
- Set via SQL seed script: `UPDATE profiles SET role = 'admin' WHERE email = 'admin@mastersync.com'`

## Database Schema

### Tables

#### profiles (extends auth.users)
```sql
- id (UUID, FK to auth.users)
- email (TEXT, UNIQUE)
- username (TEXT, UNIQUE)
- first_name (TEXT)
- last_name (TEXT)
- phone (TEXT)
- country (TEXT)
- state (TEXT)
- city (TEXT)
- address (TEXT)
- role (ENUM: user, admin)
- kyc_status (ENUM: pending, auto_verified, manually_verified, rejected)
- kyc_rejection_reason (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### otp_codes
```sql
- id (UUID)
- email (TEXT)
- code (TEXT)
- expires_at (TIMESTAMPTZ)
- verified (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

#### kyc_submissions
```sql
- id (UUID)
- user_id (UUID, FK to auth.users)
- document_type (TEXT)
- file_path (TEXT)
- status (ENUM: pending, auto_verified, manually_verified, rejected)
- rejection_reason (TEXT)
- uploaded_at (TIMESTAMPTZ)
- reviewed_at (TIMESTAMPTZ)
```

#### balances (mock)
```sql
- id (UUID)
- user_id (UUID, FK to auth.users)
- asset (TEXT)
- amount (DECIMAL)
- updated_at (TIMESTAMPTZ)
```

#### trades (mock)
```sql
- id (UUID)
- user_id (UUID, FK to auth.users)
- pair (TEXT)
- side (ENUM: buy, sell)
- type (ENUM: market, limit)
- amount (DECIMAL)
- price (DECIMAL)
- status (ENUM: pending, filled, cancelled)
- created_at (TIMESTAMPTZ)
```

### Row Level Security (RLS) Policies
- Users can only read/write their own data
- Admins can read/write all data
- Enforced at database level for security

## Technical Setup

### Supabase Configuration
1. Create Supabase project
2. Enable email auth (confirmations optional)
3. Set up RLS policies on all tables
4. Create Storage bucket: `kyc-documents` (private)
5. Configure storage policies for user-owned files

### Supabase Client Setup
- **Server**: `createServerClient` (with cookies)
- **Client**: `createBrowserClient`
- **Admin**: `createClient` with service role key (server-only)

### Middleware Protection
- Protect `/dashboard/*` routes → redirect unauth to `/login`
- Protect `/admin/*` routes → check admin role
- Redirect authenticated users away from auth pages

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (server-only)
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_TURNSTILE_SITE_KEY (Cloudflare Turnstile)
```

### Folder Structure
```
src/
├── actions/          # Server actions
│   ├── auth.ts
│   ├── kyc.ts
│   └── admin.ts
├── app/              # Pages (App Router)
│   ├── (auth)/       # Auth pages
│   ├── dashboard/    # User dashboard
│   └── admin/        # Admin panel
├── components/       # React components
│   ├── ui/
│   ├── dashboard/
│   ├── auth/
│   └── admin/
├── lib/              # Utilities
│   ├── supabase/
│   ├── email.ts
│   └── utils.ts
├── emails/           # React Email templates
├── schemas/          # Zod validation schemas
├── types/            # TypeScript types
└── middleware.ts     # Route protection
```

## UI/UX Requirements

### Design Principles
- **Modern fintech aesthetic**: Minimalist cards, subtle gradients, glassmorphism
- **Responsive**: Mobile-first design
- **Accessible**: ARIA labels, semantic HTML, keyboard navigation
- **Smooth animations**: Hover/focus states, transitions
- **High contrast**: Readable in both light/dark modes
- **Primary accent**: Indigo/blue for crypto vibe

### HeroUI Components Used
- Button, Card, Input, Modal, Table, Dropdown, Switch
- Avatar, Chip, Stepper, Progress, Alert, Toast
- Form, Autocomplete, InputOtp, DatePicker

### Theme System
- Light/dark mode toggle
- System preference detection
- Persistent via cookies/localStorage
- Smooth transitions between modes

## Security Best Practices

1. **Authentication**
   - Supabase Auth handles sessions
   - HTTP-only cookies for tokens
   - CAPTCHA on login/register (Cloudflare Turnstile)
   - OTP verification for sensitive actions

2. **Authorization**
   - RLS policies enforce data access
   - Role-based access control (user/admin)
   - Server-side validation on all actions

3. **Data Protection**
   - Never expose service role key client-side
   - Signed URLs for file access (1-hour expiry)
   - Input validation with Zod
   - Rate limiting on OTP/resends

4. **File Uploads**
   - User-scoped paths: `{user_id}/{filename}`
   - Private bucket with RLS
   - File type validation
   - Size limits enforced

## Email Templates

### Welcome Email
- Sent after successful registration
- Includes next steps (KYC verification)
- Branded with MasterSync logo/colors

### OTP Email
- 6-digit code with 48px font size
- 8px letter spacing for readability
- 10-minute expiry notice
- Resend link with cooldown

### Password Reset
- Secure reset link with token
- Expiry notice (1 hour)
- Security tips

## Future Enhancements
- 2FA/TOTP support
- Supabase Realtime for live updates
- Advanced trading features (stop-loss, take-profit)
- Mobile app (React Native)
- API for third-party integrations
- Advanced analytics dashboard
- Social trading features
- Referral program
