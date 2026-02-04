# Cloudflare Turnstile Setup Guide

## 1. Get Turnstile Site Key

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** section
3. Create a new site
4. Copy your **Site Key**

## 2. Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers** → **Cloudflare Turnstile**
3. Enable Cloudflare Turnstile
4. Add your Turnstile **Secret Key** from Cloudflare

## 3. Add to Environment Variables

Add to your `.env` file:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key-here"
```

## 4. Local Development

For local testing, add `localhost` to the domain allowlist in Cloudflare Turnstile settings:

1. Go to your Turnstile site settings in Cloudflare
2. Add `localhost` to the **Domains** list
3. Save changes

## 5. Production Deployment

Add your production domain to the Cloudflare Turnstile domain allowlist:

1. Go to Turnstile site settings
2. Add your production domain (e.g., `yourdomain.com`)
3. Update the environment variable in your hosting platform

## How It Works

- User enters email on registration page
- Turnstile CAPTCHA widget appears
- User completes CAPTCHA challenge
- Continue button is disabled until CAPTCHA is verified
- CAPTCHA token is sent with the registration request
- Supabase validates the token on the backend

## Testing

1. Start dev server: `pnpm dev`
2. Go to `/register`
3. Enter email
4. Complete CAPTCHA challenge
5. Continue button should become enabled
6. Proceed with registration

## Notes

- CAPTCHA token is automatically validated by Supabase
- Token is included in the `signInWithPassword` call
- No additional backend validation needed
- Turnstile is privacy-friendly and GDPR compliant
