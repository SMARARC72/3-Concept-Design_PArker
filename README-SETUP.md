# ParkerJoe Setup Guide

## 🚀 Quick Start

### 1. Environment Variables
All secrets are now in `.env` files (never commit these!):

**Root `.env`** (server-side secrets):
- Supabase service role key
- Database password
- Shopify admin API keys
- Private API keys

**`app/.env`** (public/frontend):
- Supabase anon key
- Shopify storefront token
- Public analytics keys

### 2. Database Setup

Since CLI authentication failed, run migrations via SQL Editor:

1. Go to: https://supabase.com/dashboard/project/sqqocqjsonirxvgivupm/sql/new

2. Copy the entire contents of `supabase/all-migrations.sql`

3. Paste into SQL Editor and click "Run"

### 3. Start Development Server

```bash
cd app
npm run dev
```

Open http://localhost:5173

## 🔒 Security Notes

- **NEVER** commit `.env` files to git
- `.gitignore` is configured to exclude all env files
- Use different keys for production vs development
- Rotate keys regularly

## 📁 Project Structure

```
parkerjoe/
├── .env                          # Server secrets (NOT in git)
├── app/
│   ├── .env                      # Frontend vars (NOT in git)
│   └── src/
│       ├── components/chat/      # AI Chat widget
│       ├── context/              # React contexts
│       ├── lib/                  # Security & COPPA utils
│       ├── services/             # API clients
│       └── types/                # TypeScript types
└── supabase/
    ├── migrations/               # SQL migrations
    └── all-migrations.sql        # Combined for easy running
```

## 🤖 AI Chat Features

The PJ Stylist chat widget is now available at bottom-right of the page!

## ✅ COPPA Compliance

- Age detection in chat
- 30-day conversation retention
- PII detection and filtering
- Child account flagging
