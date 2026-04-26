# SubSutra

Data-driven analytics for Substack creators — post scoring, subscriber growth tracking, churn alerts, and revenue intelligence.

## What is SubSutra?

SubSutra is a SaaS analytics tool built for Substack creators. It connects to a creator's publication and delivers personalized insights that Substack's native dashboard doesn't provide:

- **Post Performance Scorer** — every post graded A–F based on opens, clicks, subscriber gains, and restacks
- **Subscriber Growth Timeline** — interactive chart with spike annotations tied to specific posts
- **Best Day & Time to Publish** — personalized heatmap based on your audience's behavior
- **Free → Paid Conversion Tracker** — see which posts drive paid upgrades

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth.js |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

1. Clone the repo and install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and set your `DATABASE_URL`:

```
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

3. Push the database schema:

```bash
npx prisma db push
```

4. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Schema

Core models:

- **User** — app accounts
- **SubstackConnection** — links a user to their Substack publication
- **Post** — synced posts from Substack
- **PostMetrics** — performance scores, open/click rates, conversion data
- **SubscriberEvent** — subscribe/unsubscribe/upgrade events for growth timeline

## Project Structure

```
app/            → Next.js App Router (pages, layouts, API routes)
prisma/         → Prisma schema & migrations
docs/           → Product requirements & specs
public/         → Static assets
```

## Roadmap

- **V1 (MVP)** — Post scoring, growth timeline, publish timing, conversion tracking
- **V2 (Growth)** — Notes analytics, churn monitor, audience overlap, weekly AI reports
- **V3 (Pro)** — Revenue dashboard, topic analyzer, competitor benchmarking

See [docs/substack-growth-analyzer-prd.md](docs/substack-growth-analyzer-prd.md) for the full PRD.

## License

Private — all rights reserved.
