# Product Requirements Document (PRD)
## Substack Growth Analyzer

**Version:** 1.0  
**Last Updated:** April 26, 2026  
**Status:** Draft  
**Author:** TBD  
**Target Launch:** TBD  

---

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Goals & Success Metrics](#goals--success-metrics)
5. [Version 1 — Core (MVP)](#version-1--core-mvp)
6. [Version 2 — Growth Features](#version-2--growth-features)
7. [Version 3 — Premium Intelligence](#version-3--premium-intelligence)
8. [Pricing Strategy](#pricing-strategy)
9. [Technical Architecture](#technical-architecture)
10. [Out of Scope](#out-of-scope)
11. [Risks & Assumptions](#risks--assumptions)
12. [Timeline](#timeline)

---

## Overview

**Substack Growth Analyzer** is a SaaS analytics tool built exclusively for Substack creators. It connects to a creator's Substack publication and delivers deep, personalized, data-driven insights that Substack's native dashboard simply does not provide.

While Substack's built-in analytics show basic metrics (opens, clicks, subscriber count), they fail to answer the questions creators actually care about:

- *Which posts are turning free readers into paying subscribers?*
- *Why did I gain 200 subscribers last Tuesday?*
- *Which Notes drove the most growth?*
- *Am I about to lose subscribers — and why?*

Substack Growth Analyzer answers all of these — automatically, weekly, in plain English.

---

## Problem Statement

Substack's native analytics are basic and surface-level. Creators who want to grow their publication seriously are left flying blind. Specifically:

- **No subscriber cohort tracking** — creators can't see which subscribers stay vs. leave
- **No Notes analytics** — zero data on which Notes drove subscribers
- **No churn alerts** — no warning when unsubscribe rate spikes
- **No content intelligence** — no insight into which topics perform best
- **No revenue forecasting** — no visibility into MRR growth trajectory
- **No collaboration intelligence** — no data on audience overlap with other creators

The result: Creators make decisions based on gut feel instead of data, leading to slower growth, higher churn, and lost revenue.

---

## Target Users

### Primary User
**Independent Substack creators** with 100–50,000 subscribers who are actively trying to grow their publication and monetize their audience.

### User Personas

| Persona | Description | Key Pain |
|---|---|---|
| **The Grower** | 100–2,000 subs, free newsletter, wants to hit 1K paid | Doesn't know what content drives subscriptions |
| **The Monetizer** | 2,000–10,000 subs, has paid tier, wants to reduce churn | Can't see which posts convert free → paid |
| **The Pro** | 10,000+ subs, full-time creator, runs it like a business | Needs revenue forecasting and competitive benchmarking |

---

## Goals & Success Metrics

### Business Goals
- Reach $10K MRR within 6 months of launch
- Achieve < 5% monthly churn rate
- Maintain NPS score > 50

### Product Goals
- Reduce time creators spend manually analyzing their data by 80%
- Help creators increase their open rates by at least 10% within 60 days
- Surface at least 3 actionable insights per creator per week

### Key Metrics to Track
- Monthly Recurring Revenue (MRR)
- Churn Rate
- Weekly Active Users (WAU)
- Feature Adoption Rate per tier
- Average Revenue Per User (ARPU)

---

## Version 1 — Core (MVP)

**Goal:** Validate that creators will pay for deeper analytics. Ship fast, solve the most painful problems first.  
**Target Build Time:** 3–4 weeks  
**Price Tier:** Starter ($9/mo)

---

### Feature 1.1 — Post Performance Scorer

**Description:**  
Every post a creator has published gets automatically analyzed and scored on a letter grade (A / B / C / D / F) based on a weighted combination of performance metrics.

**Metrics Used in Scoring:**
- Open rate (weighted 30%)
- Click-through rate (weighted 20%)
- New subscribers gained within 48 hours of publish (weighted 30%)
- Social shares / restacks (weighted 20%)

**Output:**
- A sortable table of all posts with scores
- A plain-English summary: *"Posts about personal stories get 40% more opens than how-to posts"*
- Top 3 highest-scoring posts highlighted with a badge

**User Story:**  
As a Substack creator, I want to know which of my posts performed best so I can write more content that resonates with my audience.

**Acceptance Criteria:**
- [ ] All published posts are fetched and displayed within 30 seconds
- [ ] Each post is assigned a grade (A–F) based on the scoring algorithm
- [ ] Creator can sort posts by grade, date, open rate, or subscriber gain
- [ ] Summary insight shown at top of page in plain English

---

### Feature 1.2 — Subscriber Growth Timeline

**Description:**  
An interactive visual chart showing subscriber growth over time, with key posts and Notes pinned directly on the chart at the date they were published. Creators can see exactly which action caused each growth spike.

**Output:**
- Line chart with subscriber count over time
- Spike annotations: *"You published 'My Story' on March 3rd → gained 200 subscribers"*
- Ability to click any spike to see the post that caused it
- Filter by date range (7 days / 30 days / 90 days / all time)

**User Story:**  
As a creator, I want to understand what actions caused my growth spikes so I can replicate them intentionally.

**Acceptance Criteria:**
- [ ] Chart renders growth data for all time
- [ ] At least the top 5 growth events are annotated with the causative post/Note
- [ ] Clicking an annotation opens a preview of the post
- [ ] Date range filter works correctly

---

### Feature 1.3 — Best Day & Time to Publish

**Description:**  
Based on the creator's own historical publish and open data, the tool calculates the optimal day of the week and time of day to publish for maximum open rates. This is not generic advice — it is personalized to each creator's specific audience behavior.

**Output:**
- A heatmap grid (day × time) colored by average open rate
- A clear recommendation: *"Your audience opens emails most on Tuesday at 9 AM"*
- Confidence indicator based on how much historical data is available

**User Story:**  
As a creator, I want to know the best time to send my newsletter so more of my subscribers actually read it.

**Acceptance Criteria:**
- [ ] Heatmap renders accurately based on historical open data
- [ ] A clear top recommendation is always displayed
- [ ] If < 10 posts published, a low-confidence warning is shown
- [ ] Recommendation updates automatically as new posts are published

---

### Feature 1.4 — Free → Paid Conversion Tracker

**Description:**  
Tracks which posts and content types are most responsible for converting free subscribers into paying subscribers. This answers the single biggest question for monetizing creators.

**Output:**
- A ranked list of posts by conversion impact (free → paid upgrades within 72 hours of publish)
- Content pattern summary: *"Posts with 'behind the scenes' in the title convert 3x better"*
- Conversion rate trend over time (improving or declining?)

**User Story:**  
As a creator with a paid tier, I want to know which of my posts are converting free readers to paid subscribers so I can write more of that content.

**Acceptance Criteria:**
- [ ] Only visible for creators with a paid tier enabled
- [ ] Conversion is attributed to the most recent post published within 72 hours of upgrade
- [ ] Top converting post is highlighted prominently
- [ ] Trend line shows if conversion rate is improving month-over-month

---

## Version 2 — Growth Features

**Goal:** Drive retention and make the tool indispensable for serious creators. Add collaborative and engagement intelligence.  
**Target Build Time:** 3–4 weeks after V1  
**Price Tier:** Growth ($29/mo) — includes all V1 features

---

### Feature 2.1 — Notes Performance Tracker

**Description:**  
Substack Notes is now the platform's most powerful internal growth channel, yet Substack provides zero analytics on Notes performance. This feature fills that gap completely.

**Metrics Tracked Per Note:**
- Impressions
- Likes / Restacks / Comments
- Subscriber conversions attributed to each Note
- Follower gains per Note

**Output:**
- A feed of all Notes with performance metrics
- Top 3 performing Notes of the week highlighted
- Pattern insight: *"Notes with questions get 2x more comments"*
- Trend: Notes engagement over time (improving or declining?)

**User Story:**  
As a creator who posts Notes daily, I want to know which types of Notes are actually growing my subscriber count so I can focus my energy on what works.

**Acceptance Criteria:**
- [ ] All Notes from the past 90 days are fetched and displayed
- [ ] Each Note shows at minimum: likes, restacks, comments, and estimated subscriber gain
- [ ] Top performing Note of the week is surfaced automatically
- [ ] Pattern insight refreshes weekly based on new data

---

### Feature 2.2 — Churn & Retention Monitor

**Description:**  
Proactively alerts creators when their unsubscribe rate spikes above normal, and attempts to identify which post or action may have caused the spike. This is a major gap in Substack's native analytics.

**Output:**
- Real-time unsubscribe rate tracker (daily / weekly / monthly)
- Alert notification when unsubscribe rate exceeds 2x the creator's average
- Correlation analysis: *"Your unsubscribe rate spiked 3x after publishing 'Hot Take on AI' on April 12th"*
- Subscriber lifetime value (average how long a subscriber stays)
- Cohort retention table: of subscribers gained in Month X, how many are still subscribed?

**User Story:**  
As a creator, I want to be alerted when I'm losing subscribers faster than normal, and I want to understand why, so I can fix it before it becomes a serious problem.

**Acceptance Criteria:**
- [ ] Unsubscribe rate is calculated daily
- [ ] Alert email is sent within 24 hours of a significant spike
- [ ] Correlation with recent posts is shown (best-guess attribution)
- [ ] Cohort table shows retention for each month's new subscriber cohort
- [ ] Subscriber lifetime value is displayed prominently

---

### Feature 2.3 — Audience Overlap Intelligence

**Description:**  
Identifies which other Substack publications the creator's subscribers also read, and suggests the most strategically valuable creators to collaborate with based on audience overlap.

**Output:**
- Top 10 publications with highest audience overlap percentage
- Collaboration suggestion score for each overlapping publication
- Filter by: niche, size, paid/free
- One-click option to draft a collaboration outreach message

**User Story:**  
As a creator, I want to know which other Substack creators share my audience so I can pursue collaborations that will drive mutual growth.

**Acceptance Criteria:**
- [ ] Overlap data is calculated from subscriber cross-referencing
- [ ] At least 10 overlapping publications are shown where data is available
- [ ] Collaboration score is explained transparently (why this creator is recommended)
- [ ] Outreach message draft is generated using AI, pre-filled with relevant context

---

### Feature 2.4 — Weekly AI Growth Report

**Description:**  
Every Monday morning, each creator automatically receives a personalized, plain-English growth report summarizing the past week's performance and providing 3 specific, actionable recommendations for the coming week.

**Report Contents:**
- Subscriber gain/loss this week vs. last week
- Top performing post of the week
- Notes performance summary
- Open rate trend
- 3 AI-generated action items specific to their data
- One "insight of the week" (a pattern discovered in their data)

**Delivery:** Email + in-app dashboard card

**User Story:**  
As a busy creator, I want a concise weekly summary of how my Substack is performing and exactly what I should do next, delivered without me having to log in and dig through data.

**Acceptance Criteria:**
- [ ] Report is sent every Monday between 7–9 AM in the creator's timezone
- [ ] All data in the report is accurate as of Sunday midnight
- [ ] 3 action items are specific and actionable (not generic tips)
- [ ] Creator can customize report delivery time in settings
- [ ] Creator can disable the report if they prefer in-app only

---

## Version 3 — Premium Intelligence

**Goal:** Serve professional creators running Substack as a full business. High-ticket features that justify a significant price increase.  
**Target Build Time:** 4–6 weeks after V2  
**Price Tier:** Pro ($59/mo) — includes all V1 + V2 features

---

### Feature 3.1 — Revenue Intelligence Dashboard

**Description:**  
A complete financial overview of the creator's Substack business, including MRR, churn rate, subscriber lifetime value, and a forward-looking revenue forecast.

**Metrics Tracked:**
- Monthly Recurring Revenue (MRR)
- MRR growth rate (month-over-month)
- Average subscriber lifetime value (LTV)
- Paid subscriber churn rate
- Revenue per post (estimated)
- MRR forecast: 3-month projection at current growth rate

**Output:**
- A financial dashboard styled like a real business analytics tool
- Revenue forecast chart: *"At your current growth rate, you'll hit $5K/mo in 4 months"*
- LTV trend over time
- Breakdown: revenue from new subscribers vs. retained subscribers

**User Story:**  
As a full-time creator, I want to understand my Substack as a business — including my MRR, churn, and revenue trajectory — so I can make informed decisions about my content strategy and financial planning.

**Acceptance Criteria:**
- [ ] MRR is calculated accurately from paid subscriber data
- [ ] Forecast uses a rolling 90-day growth rate, not a single data point
- [ ] LTV is explained in plain English alongside the number
- [ ] Dashboard refreshes daily
- [ ] Creator can export revenue data as CSV

---

### Feature 3.2 — Content Topic Analyzer

**Description:**  
Uses AI to cluster all of a creator's posts by topic, then maps topic clusters to performance metrics. Tells the creator definitively which topics they should write more of and which they should deprioritize.

**Output:**
- Visual topic map showing all post clusters
- Performance score for each topic cluster (engagement, growth, conversion)
- Clear recommendation: *"Stop writing about productivity. Double down on personal essays — they drive 3x more paid conversions."*
- Content calendar suggestion based on top-performing topics

**User Story:**  
As a creator with 100+ posts, I want to know which topics I should focus on going forward based on what has actually driven growth and revenue, not just what I feel like writing about.

**Acceptance Criteria:**
- [ ] AI clustering works with minimum 20 published posts
- [ ] Each cluster is given a human-readable label (not just a number)
- [ ] Performance scores are explained with the underlying data
- [ ] Recommendation is updated when new posts are published
- [ ] Creator can manually re-label topic clusters if the AI mislabels them

---

### Feature 3.3 — Competitor Benchmarking

**Description:**  
Allows creators to see how their key metrics compare against anonymized aggregated data from similar-sized Substacks in their niche. Benchmarking gives creators context for whether their performance is strong or weak relative to peers.

**Benchmarks Available:**
- Open rate vs. niche average
- Paid conversion rate vs. niche average
- Monthly subscriber growth rate vs. niche average
- Churn rate vs. niche average

**Output:**
- Side-by-side comparison: creator's metric vs. niche benchmark
- Performance indicator: above average / at average / below average
- Actionable context: *"Your open rate is 34%. Top creators in the Finance niche average 41%. Here's what they do differently."*

**User Story:**  
As a creator, I want to know if my metrics are good or bad relative to similar creators, so I know where to focus my improvement efforts.

**Acceptance Criteria:**
- [ ] Benchmarks are segmented by niche (minimum 5 niches at launch)
- [ ] Benchmarks are segmented by publication size (< 1K, 1K–10K, 10K+ subscribers)
- [ ] All benchmark data is anonymized and aggregated
- [ ] Benchmarks are updated monthly
- [ ] Creator can opt out of contributing their data to benchmarks

---

## Pricing Strategy

| Plan | Target User | Monthly Price | Annual Price | Features |
|---|---|---|---|---|
| **Starter** | New/small creators (< 500 subs) | $9/mo | $79/yr | V1 features only |
| **Growth** | Active growers (500–10K subs) | $29/mo | $249/yr | V1 + V2 features |
| **Pro** | Full-time creators (10K+ subs) | $59/mo | $499/yr | V1 + V2 + V3 features |

### Additional Notes
- 14-day free trial on all plans, no credit card required
- Annual plan saves ~30% vs monthly
- Free plan (read-only, last 30 days data only) available to drive top-of-funnel signups

---

## Technical Architecture

### Data Access
- Substack does not have an official public API
- Data will be collected via:
  - **OAuth-based login** using Substack credentials (creator authorizes access)
  - **Web scraping** of the creator's own dashboard (authenticated session)
  - **Substack's unofficial API endpoints** (used by their own dashboard)

### Tech Stack (Recommended)
| Layer | Technology |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js / Express or Python / FastAPI |
| Database | PostgreSQL (subscriber data) + Redis (caching) |
| AI/ML | OpenAI GPT-4o or Claude API (insights generation) |
| Charts | Recharts or Chart.js |
| Auth | NextAuth.js |
| Hosting | Vercel (frontend) + Railway or Render (backend) |
| Payments | Lemon Squeezy or Stripe |
| Email | Resend or Postmark (weekly reports) |

### Data Refresh Cadence
- Subscriber count: every 6 hours
- Post metrics: every 24 hours
- Notes metrics: every 12 hours
- Revenue data: every 24 hours
- Weekly report: generated every Sunday midnight, delivered Monday 8 AM

---

## Out of Scope

The following features are explicitly **not** included in V1, V2, or V3 and will be considered for future roadmap only:

- Content writing or AI draft generation (out of scope — focus is analytics only)
- Scheduling posts or Notes
- Email automation / drip sequences
- Multi-publication management (single publication per account at launch)
- Mobile app (web-only at launch)
- Integration with external platforms (Twitter, LinkedIn, etc.)

---

## Risks & Assumptions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Substack blocks unofficial API access | Medium | High | Build scraping fallback; monitor for changes |
| Low willingness to pay at $29/mo | Low | High | Validate with 10 pre-sales before building V2 |
| Substack launches competing analytics feature | Low | Medium | Focus on insights layer, not just raw data |
| Data accuracy issues from scraping | Medium | Medium | Show confidence scores, allow manual data correction |
| Creator privacy concerns | Low | High | Clear data policy, opt-out of benchmarking, no data selling |

### Key Assumptions
- Creators are willing to share Substack credentials or authorize access via OAuth
- Substack's unofficial API endpoints remain accessible during development
- Target creators check their analytics at least weekly
- The $29/mo price point is acceptable for serious creators (validated by comparable tools)

---

## Timeline

| Milestone | Target Date | Description |
|---|---|---|
| **Kickoff** | Week 1 | Finalize PRD, set up repo, design system |
| **Data Layer** | Week 2 | Substack auth + data fetching pipeline working |
| **V1 Alpha** | Week 3–4 | All V1 features functional (internal testing) |
| **V1 Beta** | Week 5 | 10 beta creators onboarded, feedback collected |
| **V1 Public Launch** | Week 6 | Public launch on Product Hunt + Substack |
| **V2 Development** | Week 7–10 | Build all V2 features |
| **V2 Launch** | Week 11 | Upgrade path opened for existing users |
| **V3 Development** | Week 12–17 | Build all V3 features |
| **V3 Launch** | Week 18 | Pro plan goes live |

---

## Appendix — Key Insight That Drives This Product

> Substack has 35 million total active subscriptions but only 5 million paid.  
> That gap — 30 million free readers who haven't converted — is the single biggest monetization opportunity for every creator on the platform.  
> **Substack Growth Analyzer exists to help every creator close that gap, faster.**

---

*Document maintained by the founding team. All feature specs subject to change based on user research and beta feedback.*
