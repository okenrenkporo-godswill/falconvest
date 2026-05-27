# FalconVest - Crypto Trading Platform

A production-grade cryptocurrency broker and trading platform built with Next.js 15, TypeScript, and Supabase.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (Auth, Database, Storage)
- **UI Library**: HeroUI
- **Styling**: Tailwind CSS v4
- **Email**: Resend + React Email
- **Security**: Cloudflare Turnstile CAPTCHA

## ✨ Features

### Core Platform

- Multi-step registration with OTP verification
- Advanced KYC verification (document capture, OCR, face matching)
- Admin control panel with KYC review
- User dashboard with portfolio overview
- Email notifications
- Two-factor authentication
- Deposit & Withdrawal system with admin approval

### Trading Features ✅

- **Copy Trading System** - Follow and copy successful traders
- **Spot Trading** - Execute market orders with real-time balance updates
- **Positions Management** - Open/close trading positions with P&L tracking
- **Staking System** - Earn rewards by locking crypto assets
- **Holdings Management** - Portfolio overview with account transfers

### Admin Features ✅

- Trader management and approval
- Copy trades monitoring with manual trade simulation
- Trading activity monitoring
- Staking pools management (create, edit, activate/deactivate)
- Holdings overview across all users
- Deposit/withdrawal approval system

## 🛠️ Local Development Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd FalconVest
pnpm install
```

### 2. Environment Variables

Create `.env.local` and ask team lead for credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Download Face Detection Models

```bash
mkdir -p public/models && cd public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
cd ../..
```

### 4. Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Test Accounts

Ask team lead for:

- **User account** - Test user flows
- **Admin account** - Access `/cpanel`

## 📁 Project Structure

```
src/
├── actions/          # Server actions (auth, kyc, admin)
├── app/
│   ├── (auth)/      # Login, register
│   ├── cpanel/      # Admin panel
│   ├── dashboard/   # User dashboard
│   └── onboarding/  # KYC flow
├── components/      # Reusable components
├── emails/          # Email templates
└── lib/             # Utilities (supabase, ocr, email)
```

## 🔑 Key Routes

- `/register` - User registration
- `/login` - User login
- `/cpanel` - Admin login
- `/cpanel/kyc-pending` - KYC review queue
- `/dashboard` - User dashboard
- `/onboarding/kyc-advanced` - KYC submission

## 🧪 Testing Flows

### User Flow

1. Register → Verify OTP → Complete profile
2. Submit KYC (document + selfie)
3. Check status at `/onboarding/kyc-advanced`

### Admin Flow

1. Login at `/cpanel`
2. Review KYC at `/cpanel/kyc-pending`
3. Approve/reject with notes

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/name`
5. Open Pull Request

### Code Style

- TypeScript strict mode
- Use server actions for mutations
- Add error handling
- Follow existing patterns

## 🐛 Common Issues

**"Invalid JWT" errors**

- Check `.env.local` has correct Supabase keys
- Clear cookies and re-login

**Models not loading**

- Ensure models are in `public/models/`
- Check browser console for 404 errors

**Admin can't access cPanel**

- Ask team lead to set your role to 'admin' in database

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [HeroUI Docs](https://heroui.com)

---

**Questions?** Ask in team chat or contact project lead.
