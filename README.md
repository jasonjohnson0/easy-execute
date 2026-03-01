# Easy Execute — Local Deals Platform

**Share and discover local deals with QR codes, tracking, and analytics.**

Easy Execute connects local businesses with deal-hungry consumers. Businesses create offers (percentage off, BOGO, fixed discount), generate trackable QR codes, and monitor performance via a real-time analytics dashboard. Consumers browse, filter, favorite, and share deals — all from a fast, installable PWA.

## Features

- 🏷️ **Deal Management** — Create, edit, and expire deals with multiple discount types
- 📱 **QR Codes** — Dynamic generation with referral tracking (`?ref=userId`)
- 📊 **Analytics Dashboard** — Visualize scans, shares, and signups over time (Recharts)
- 🔍 **Search & Filter** — Category, location, discount range, expiration, and sort
- ❤️ **Favorites** — Save and revisit deals
- 🌗 **Dark Mode** — System-aware theme toggle
- 🔔 **Real-time Updates** — Supabase Realtime subscriptions
- 💳 **Stripe Subscriptions** — Membership gating with checkout & customer portal
- 📲 **PWA** — Installable, offline-capable, service worker caching
- 🔒 **Security** — CSP headers, DOMPurify sanitization, RLS policies, rate limiting

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions, Realtime, Storage) |
| Payments | Stripe (Checkout, Customer Portal, Webhooks) |
| Charts | Recharts |
| PWA | Custom service worker, Web App Manifest |

## Getting Started

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

Or use the [Lovable editor](https://lovable.dev/projects/edc6a0b7-0ed4-4d87-b7f6-b412445a2fc4) to develop in-browser.

## Environment Variables

Automatically populated by Lovable/Supabase connection:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Edge function secrets (configured in Supabase dashboard):

- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project Structure

```
src/
├── components/     # UI components (Header, DealCard, modals, admin panels)
├── hooks/          # Custom React hooks (useAuth, useDeals, useSubscription…)
├── lib/            # Utilities (security, analytics, performance, PWA)
├── pages/          # Route-level components
├── types/          # TypeScript type definitions
└── integrations/   # Supabase client & generated types

supabase/
├── functions/      # Edge functions (Stripe checkout, subscription checks)
├── migrations/     # Database migrations
└── config.toml     # Supabase project config
```

## Deployment

Click **Share → Publish** in the Lovable editor, or push to the connected GitHub repo for automatic deploys.

## License

Private — all rights reserved.
