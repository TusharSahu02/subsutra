# 🔮 SubSutra

**Data-driven analytics for Substack creators** — post scoring, subscriber growth tracking, churn alerts, and revenue intelligence.

> Substack doesn't give creators the analytics they need. SubSutra fills that gap.

---

## What is SubSutra?

SubSutra is a SaaS analytics platform built for Substack creators. It connects to a creator's publication via a lightweight Chrome extension and delivers personalized insights that Substack's native dashboard doesn't provide:

- **Post Performance Scorer** — every post graded A–F based on opens, clicks, subscriber gains, and restacks
- **Subscriber Growth Timeline** — interactive chart with spike annotations tied to specific posts
- **Best Day & Time to Publish** — personalized heatmap based on your audience's behavior
- **Free → Paid Conversion Tracker** — see which posts drive paid upgrades

---

## Architecture

SubSutra uses a **hybrid architecture** to work around Substack's lack of an official API:

```
┌──────────────────────┐
│   Chrome Extension    │  Runs in the creator's browser
│                       │  • Reads Substack cookies from Chrome's cookie jar
│   Automatic:          │  • Sends cookies (encrypted) to SubSutra server
│   • On browser start  │  • Refreshes every 6 hours via chrome.alarms
│   • Every 6 hours     │  • Zero user interaction after install
└──────────┬───────────┘
           │ POST /api/sync/cookies
           ▼
┌──────────────────────┐
│   Next.js Server      │
│                       │  • Stores encrypted cookies per user (AES-256)
│   Cron (every 30m):   │  • Fetches Substack data using stored cookies
│   GET /api/sync/cron  │  • Upserts posts, metrics, subscriber events
│                       │  • Marks cookies invalid on 401 → extension re-sends
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   PostgreSQL (Neon)   │  Posts, metrics, subscriber events, connections
└──────────────────────┘
```

**Why this approach?**

| Concern | Solution |
|---|---|
| No official Substack API | Chrome extension reads authenticated session cookies |
| Cookies expire | Extension auto-refreshes on browser startup + every 6h |
| Works when browser is closed | Server syncs using stored cookies on a cron schedule |
| Multi-user SaaS | Each user's cookies stored separately, encrypted at rest |
| Cloudflare bot detection | Server-side requests use browser-grade headers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL ([Neon](https://neon.tech)) |
| ORM | [Prisma](https://prisma.io) |
| Auth | [NextAuth.js](https://authjs.dev) (Google OAuth) |
| Extension | Chrome Manifest V3 |
| Encryption | AES-256-CBC (Node.js crypto) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
AUTH_SECRET="<random-secret>"
AUTH_GOOGLE_ID="<google-client-id>"
AUTH_GOOGLE_SECRET="<google-client-secret>"
CRON_SECRET="<random-secret-for-cron>"
```

### 3. Push the database schema

```bash
npx prisma db push
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Load the Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Log into Substack in your browser
5. Open `localhost:3000` and log in via Google
6. Click the SubSutra extension icon → **Sync Cookies Now**

The server will now sync your Substack data automatically.

---

## Project Structure

```
app/
├── api/
│   ├── auth/             → NextAuth routes + token endpoint
│   └── sync/
│       ├── route.ts      → Manual sync trigger (dashboard)
│       ├── cookies/      → Receives cookies from Chrome extension
│       └── cron/         → Server-side cron sync for all users
├── dashboard/            → Analytics dashboard pages
│   └── posts/            → Post performance + detail views
├── login/                → Login page
└── layout.tsx            → Root layout

extension/
├── manifest.json         → Chrome Manifest V3
├── background.js         → Cookie capture + auto-relay service worker
├── popup.html            → Extension popup UI
├── popup.js              → Popup logic
└── icons/                → Extension icons

lib/
├── auth.ts               → NextAuth configuration
├── crypto.ts             → AES-256 encrypt/decrypt for cookie storage
├── prisma.ts             → Prisma client singleton
├── substack.ts           → Substack API client (per-user + legacy)
└── utils.ts              → Shared utilities

prisma/
└── schema.prisma         → Database schema

docs/                     → Product requirements & specs
scripts/                  → API exploration & spike scripts
```

---

## Database Schema

| Model | Purpose |
|---|---|
| **User** | App accounts (Google OAuth) |
| **SubstackConnection** | Links user to their publication, stores encrypted cookies |
| **Post** | Synced posts from Substack |
| **PostMetrics** | Performance scores, reactions, restacks, publish timing |
| **SubscriberEvent** | Subscribe/unsubscribe/upgrade events for growth timeline |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sync` | Session | Manual sync trigger from dashboard |
| `POST` | `/api/sync/cookies` | Session | Receives cookies from Chrome extension |
| `GET` | `/api/sync/cron` | Bearer (`CRON_SECRET`) | Syncs all users — call on a schedule |
| `GET` | `/api/auth/token` | Session | Returns user ID for extension auth |

### Cron Setup

**Vercel Cron** — add to `vercel.json`:
```json
{
  "crons": [{ "path": "/api/sync/cron", "schedule": "*/30 * * * *" }]
}
```

**External cron** (e.g. [cron-job.org](https://cron-job.org)):
```
GET https://your-app.vercel.app/api/sync/cron
Authorization: Bearer <CRON_SECRET>
```

---

## Roadmap

| Phase | Features | Status |
|---|---|---|
| **V1 — MVP** | Post scoring, growth timeline, publish timing, conversion tracking | 🚧 In Progress |
| **V2 — Growth** | Notes analytics, churn monitor, audience overlap, weekly AI reports | 📋 Planned |
| **V3 — Pro** | Revenue dashboard, topic analyzer, competitor benchmarking | 📋 Planned |

See [docs/substack-growth-analyzer-prd.md](docs/substack-growth-analyzer-prd.md) for the full PRD.

---

## Security

- Substack cookies are encrypted at rest using **AES-256-CBC**
- Encryption key derived from `AUTH_SECRET`
- Cookies are never logged or exposed via API responses
- Extension uses Chrome's `cookies` permission (scoped to `*.substack.com` only)
- Cron endpoint protected by `CRON_SECRET` bearer token
- All user auth via Google OAuth (no passwords stored)

---

## License

Private — all rights reserved.
