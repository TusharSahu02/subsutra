/**
 * Substack API Spike v5
 *
 * Sources:
 *   github.com/bit-of-a-shambles/substack  (Ruby gem)
 *   github.com/jakub-k-slys/substack-api   (TypeScript/npm)
 *   github.com/NHagar/substack_api         (Python pip)
 *
 * Cookie auth:  substack.sid  +  cf_clearance  +  substack.lli
 * To refresh:   DevTools → Network → any API call → Copy as cURL → grab -b "..."
 */

const FULL_COOKIES = process.env.SUBSTACK_COOKIES || `ab_experiment_sampled=%22true%22; ab_testing_id=%22fda89796-f9fa-469e-95c0-63e61d39a740%22; cookie_storage_key=c0d00dac-9385-4e16-8786-29e26375d3d6; substack.sid=s%3AAYMX02KwlOP8dIYl5fZFAjnHBeVg6jQm.BofEgXkpcP6uwATCZz31MbHqA2Lsp3cRFkIZRXgiuyc; ajs_anonymous_id=%22ef690e90d7bf46a6c4641549c55dfb71%22; cf_clearance=j.m6xIq4.IBSaFY9l.BWYpUEqUkDE5r._6XssuPjwRc-1777243680-1.2.1.1-DKRQe03MB.h0YmClwbq_h84g0Lsu0XSiqq_cHerXsAF7saAno8T_R.kGkxbg4dp6bnUBL5_TfrFKNARzQ6kwYXM6obVZxPKWMCY_5kohbZDKKCQm8DPhYlEsnDvMqPMhli7eLklUohI_NIHxBbrcHEtfa_Ih5vIbm5owr5RPXWZLJideLBVn15HRb6f2N2J2TOXZkZvWOMCXuMwdsWpwPRTQNNJtHUGSeN_VfJOEs73yuqyyoI.FX5Qa_8XFFNRnd5gaN33XC0oaFO2kjgauLcUHZ5M5.C6tm_7bxfCGHmAY0vTgJeVXuOTvZJy920HTrHBtuLNQ.Tfsv7oP4w1Z6w; substack.lli=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwNTkwMzUxNiwiaWF0IjoxNzc3MjQ0MjE5LCJleHAiOjE3Nzk4MzYyMTksImF1ZCI6Imxpa2VseS1sb2dnZWQtaW4ifQ.yf5LRoUf2v7fvftN6yd8WZIUYRjayZ71JxGpeA8jd9s`

const PUB_URL = process.env.SUBSTACK_PUB     || "sahutushar"
const USER_ID  = process.env.SUBSTACK_USER_ID || "205903516"
const HANDLE   = process.env.SUBSTACK_HANDLE  || "sahutushar"   // public handle (not display name slug)

const BASE    = `https://${PUB_URL}.substack.com`
const SS_BASE = "https://substack.com"

const HEADERS = {
  "Cookie":          FULL_COOKIES,
  "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
  "Accept":          "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.6",
  "Referer":         `${SS_BASE}/publish/home`,
  "sec-fetch-dest":  "empty",
  "sec-fetch-mode":  "cors",
  "sec-fetch-site":  "same-origin",
  "sec-gpc":         "1",
}

function log(label, data) {
  console.log(`\n${"─".repeat(64)}`)
  console.log(`✅  ${label}`)
  console.log("─".repeat(64))
  console.log(JSON.stringify(data, null, 2).slice(0, 2000))
}

function fail(label, detail) {
  console.log(`\n${"─".repeat(64)}`)
  console.log(`❌  ${label}`)
  console.log("─".repeat(64))
  console.log(detail)
}

function skip(label, reason) {
  console.log(`\n${"─".repeat(64)}`)
  console.log(`⏭️   ${label}`)
  console.log("─".repeat(64))
  console.log(`SKIPPED — ${reason}`)
}

async function get(label, url) {
  if (!url) { fail(label, "Failed to build URL (missing dependency)"); return null }
  try {
    const res = await fetch(url, { headers: HEADERS })
    const ct  = res.headers.get("content-type") ?? ""
    if (!res.ok) {
      const text    = await res.text().catch(() => "")
      const preview = ct.includes("json") ? text.slice(0, 500) : "[HTML — wrong endpoint or blocked]"
      fail(label, `HTTP ${res.status} — ${url}\n${preview}`)
      return null
    }
    if (!ct.includes("json")) { fail(label, `Got HTML not JSON — ${url}`); return null }
    const data = await res.json()
    log(label, data)
    return data
  } catch (err) {
    fail(label, err?.message ?? err)
    return null
  }
}

;(async () => {
  console.log("🚀  Substack API Spike v5 — Correct endpoints from OSS libs")
  console.log(`    Publication : ${BASE}`)
  console.log(`    SS base     : ${SS_BASE}`)
  console.log(`    User ID     : ${USER_ID}`)
  console.log(`    Handle      : ${HANDLE}\n`)

  // ── 1. Resolve own identity ──────────────────────────────────────────────
  // Returns potentialHandles — pick type=="existing" for your own handle.
  await get("Handle options (resolve self)", `${SS_BASE}/api/v1/handle/options`)

  // ── 2. Public profile by handle ──────────────────────────────────────────
  await get("User public profile (by handle)", `${SS_BASE}/api/v1/user/${HANDLE}/public_profile`)

  // ── 3. Subscriptions ─────────────────────────────────────────────────────
  await get("Subscriptions", `${SS_BASE}/api/v1/subscriptions/page_v2`)

  // ── 4. Publication metadata ───────────────────────────────────────────────
  const pub = await get("Publication info", `${BASE}/api/v1/publication`)

  // ── 5. Posts list → extract IDs for downstream tests ─────────────────────
  const postsRes = await get("Posts list (limit 5)", `${BASE}/api/v1/posts?limit=5&offset=0`)
  const posts    = Array.isArray(postsRes) ? postsRes : (postsRes?.posts ?? [])
  const firstPost = posts[0]
  const PUB_ID   = firstPost?.publication_id
  const slug     = firstPost?.slug
  const postId   = firstPost?.id

  console.log(`\n    pub_id  : ${PUB_ID ?? "(not resolved)"}`)
  console.log(`    slug    : ${slug    ?? "(not resolved)"}`)
  console.log(`    post_id : ${postId  ?? "(not resolved)"}`)

  // ── 6. Post archive (public reader endpoints) ─────────────────────────────
  await get("Archive — newest",   `${BASE}/api/v1/archive?sort=new&limit=5&offset=0`)
  await get("Archive — top posts",`${BASE}/api/v1/archive?sort=top&limit=5&offset=0`)

  // ── 7. Per-post data ──────────────────────────────────────────────────────
  // Full detail by slug: returns body_html, reactions, restacks, postTags, audience, cover_image
  await get("Post detail (by slug)",    slug   ? `${BASE}/api/v1/posts/${slug}`            : null)

  // Same post keyed by numeric id via global SS domain — returns { post: {...} } wrapper
  await get("Post detail (by id — SS)", postId ? `${SS_BASE}/api/v1/posts/by-id/${postId}` : null)

  // Comments: returns { comments: [{ id, body, date, author_is_admin, ... }] }
  await get("Post comments",            postId ? `${BASE}/api/v1/post/${postId}/comments`  : null)

  // Reactions detail — who reacted (requires auth)
  await get("Post reactions (detail)",  postId ? `${BASE}/api/v1/post/${postId}/reactions` : null)

  // Related posts Substack surfaces after a post
  await get("Post related",             slug   ? `${BASE}/api/v1/posts/${slug}/related`    : null)

  // Post shares/boosts (notes that shared this post)
  await get("Post restacks (notes)",    postId ? `${SS_BASE}/api/v1/post/${postId}/restacks?limit=5` : null)

  // RSS feed — includes full body_html for free posts, tags, pubDate
  await get("RSS feed (parsed as JSON — will fail, shown for reference)", null)
  console.log(`\n    RSS feed URL (fetch manually): ${BASE}/feed`)
  console.log(`    Returns XML — title, link, pubDate, content:encoded, category(tags) per item`)

  // ── 9. Reader feed (authenticated) ───────────────────────────────────────
  await get("Following feed (page 0)", `${SS_BASE}/api/v1/feed/following?page=0&limit=5`)
  await get("Inbox (top)",             `${SS_BASE}/api/v1/inbox/top`)

  // ── 10. Following list ────────────────────────────────────────────────────
  await get(
    "Subscriber-lists (following)",
    `${BASE}/api/v1/user/${USER_ID}/subscriber-lists?lists=following`
  )

  // ── 11. Publication discovery ─────────────────────────────────────────────
  await get("Publication search",    `${SS_BASE}/api/v1/publication/search?query=tushar&page=0&limit=5&sort=relevance`)
  await get("Categories (all)",      `${SS_BASE}/api/v1/categories`)
  await get("Recommendations (pub)", PUB_ID ? `${BASE}/api/v1/recommendations/from/${PUB_ID}` : null)
  await get("Publication authors",   `${BASE}/api/v1/publication/users/ranked?public=true`)

  // ── 12. Live streams ──────────────────────────────────────────────────────
  await get("Live streams (active)", `${SS_BASE}/api/v1/live_streams/active`)

  // ── 13. Profile feed ─────────────────────────────────────────────────────
  await get("Profile feed (posts)",  `${SS_BASE}/api/v1/reader/feed/profile/${USER_ID}`)

  // ── NOTE — private writer-dashboard endpoints ─────────────────────────────
  // The following metrics are NOT exposed via any public Substack API and
  // require an undocumented internal writer-auth scope. No OSS lib implements them:
  //   • subscriber count / history
  //   • email open rates
  //   • revenue stats / subscription events
  //   • per-post send/open stats
  // To access these you would need to capture XHR calls from within
  // substack.com/publish after a full browser login (check Network tab).
  skip("Subscriber count",          "No public API — writer dashboard only")
  skip("Email open rates",          "No public API — writer dashboard only")
  skip("Revenue stats",             "No public API — writer dashboard only")
  skip("Per-post send/open stats",  "No public API — writer dashboard only")

  console.log(`\n${"═".repeat(64)}`)
  console.log("  Spike v5 complete.")
  console.log("  ✅ = works  |  ❌ = wrong path / blocked  |  ⏭️  = private API")
  console.log(`${"═".repeat(64)}\n`)
})()
