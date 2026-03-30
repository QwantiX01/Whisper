# VoiceNote AI — Micro MVP

Voice-to-text app with ChatGPT view, Clerk auth, and Stripe subscriptions.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Clerk |
| Database | Supabase (Postgres) + Prisma ORM |
| AI | OpenAI Whisper + GPT-4o |
| Payments | Stripe Subscriptions |
| UI | shadcn/ui + Tailwind CSS |
| Deploy | Vercel |

## User Flow

```
/ (Landing)
├── 1st record → free, no auth, saved to localStorage flag
├── 2nd record → redirect /sign-up
└── after auth → redirect /subscribe → Stripe Checkout

/subscribe → Stripe Checkout ($9/mo)
  └── on success → /records?success=true

/records (requires auth + active subscription)
  └── /records/[id] → transcript + GPT-4o chat
```

---

## Local Setup

> Requires [Bun](https://bun.sh/) >= 1.3 locally (or use the provided Bun-based Docker compose setup).

### 1. Clone & install

```bash
git clone <your-repo>
cd voice-mvp
bun install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see sections below
```

### 3. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string**
3. Copy **Pooling** (port 6543) → `DATABASE_URL`
4. Copy **Direct** (port 5432) → `DIRECT_URL`

### 4. Clerk

1. Create app at [clerk.com](https://clerk.com)
2. Copy keys to `.env.local`
3. In Clerk dashboard → **Webhooks** → add endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret → `CLERK_WEBHOOK_SECRET`

### 5. OpenAI

1. Get key at [platform.openai.com](https://platform.openai.com)
2. Add to `OPENAI_API_KEY`

### 6. Stripe

1. Create product at [stripe.com](https://stripe.com) → **Products → Add product**
   - Name: "Pro Plan"
   - Price: $9/month recurring
2. Copy **Price ID** → `NEXT_PUBLIC_STRIPE_PRICE_ID`
3. Copy API keys → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. For local webhooks:
   ```bash
   bun run stripe:listen
   # Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET
   ```

### 7. Run migrations

```bash
bun run db:push       # push schema to Supabase (dev)
# or
bun run db:migrate    # create migration files (recommended)
```

### 8. Start dev server

```bash
bun run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

```bash
# Deploy
bunx vercel deploy --prod
```

**In Vercel dashboard → Settings → Environment Variables:**
Add all variables from `.env.example`

**Update Stripe webhook:**
- Go to Stripe → Webhooks → add endpoint
- URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`
- Copy secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars

**Update Clerk:**
- Clerk dashboard → Webhooks → update URL to production domain

---

## Project Structure

```
voice-mvp/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← auth + subscription gate
│   │   └── records/
│   │       ├── page.tsx            ← records list
│   │       ├── NewRecordButton.tsx
│   │       └── [id]/page.tsx       ← chat view
│   ├── api/
│   │   ├── transcribe/route.ts     ← POST: Whisper
│   │   ├── records/route.ts        ← GET/POST
│   │   ├── records/[id]/chat/route.ts ← POST/DELETE
│   │   ├── checkout/route.ts       ← POST: Stripe session
│   │   └── webhooks/
│   │       ├── stripe/route.ts     ← subscription events
│   │       └── clerk/route.ts      ← user sync
│   ├── subscribe/page.tsx
│   ├── page.tsx                    ← landing
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         ← button, card, badge, textarea
│   ├── recorder/VoiceRecorder.tsx
│   ├── chat/ChatView.tsx
│   └── Navbar.tsx
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── openai.ts
│   ├── utils.ts
│   └── subscription.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
├── vercel.json
└── .env.example
```

---

## Scripts

```bash
bun run dev          # start dev server
bun run build        # prisma generate + next build
bun run db:push      # sync schema to DB
bun run db:migrate   # create + run migration
bun run db:studio    # open Prisma Studio
bun run stripe:listen  # forward Stripe webhooks locally
```
