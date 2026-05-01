/**
 * Substack API client — works per-user with dynamic cookies.
 * Used by both the old .env approach and the new cron sync.
 */

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function makeHeaders(cookies: string): HeadersInit {
  return {
    Cookie: cookies,
    "User-Agent": UA,
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://substack.com/publish/home",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  };
}

async function apiFetch<T>(url: string, cookies: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: makeHeaders(cookies) });
    if (res.status === 401 || res.status === 403) throw new Error("COOKIES_EXPIRED");
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("json")) return null;
    return res.json() as Promise<T>;
  } catch (e) {
    if ((e as Error).message === "COOKIES_EXPIRED") throw e;
    return null;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubstackPost {
  id: number;
  title: string;
  slug: string;
  subtitle: string | null;
  post_date: string;
  audience: "everyone" | "only_paid" | string;
  type: "newsletter" | "podcast" | string;
  is_published: boolean;
  restacks: number;
  reactions: Record<string, number>;
  canonical_url: string;
}

export interface SubstackPublication {
  id?: number;
  subdomain: string;
  name: string;
  custom_domain: string | null;
  logo_url: string | null;
}

// ─── Per-user API calls ──────────────────────────────────────────────────────

export async function fetchPublicationData(pubSlug: string, cookies: string) {
  const base = `https://${pubSlug}.substack.com`;

  const [publication, posts, topPosts] = await Promise.all([
    apiFetch<SubstackPublication>(`${base}/api/v1/publication`, cookies),
    apiFetch<SubstackPost[]>(`${base}/api/v1/archive?sort=new&limit=50&offset=0`, cookies),
    apiFetch<SubstackPost[]>(`${base}/api/v1/archive?sort=top&limit=10&offset=0`, cookies),
  ]);

  return {
    publication,
    posts: posts ?? [],
    topPosts: topPosts ?? [],
  };
}

// ─── Legacy: env-based client for backward compat ────────────────────────────

const ENV_COOKIES = process.env.SUBSTACK_COOKIES ?? "";
const ENV_PUB = process.env.SUBSTACK_PUB ?? "";
const ENV_HANDLE = process.env.SUBSTACK_HANDLE ?? "";

export async function getPublication() {
  if (!ENV_PUB) return null;
  return apiFetch<SubstackPublication>(
    `https://${ENV_PUB}.substack.com/api/v1/publication`, ENV_COOKIES
  );
}

export async function getPosts(limit = 20, offset = 0) {
  const data = await apiFetch<SubstackPost[] | { posts: SubstackPost[] }>(
    `https://${ENV_PUB}.substack.com/api/v1/posts?limit=${limit}&offset=${offset}`, ENV_COOKIES
  );
  if (!data) return [];
  return Array.isArray(data) ? data : (data.posts ?? []);
}

export async function getArchive(sort: "new" | "top" = "new", limit = 20) {
  const data = await apiFetch<SubstackPost[]>(
    `https://${ENV_PUB}.substack.com/api/v1/archive?sort=${sort}&limit=${limit}&offset=0`, ENV_COOKIES
  );
  return data ?? [];
}

export async function getProfile() {
  if (!ENV_HANDLE) return null;
  return apiFetch<{ id: number; name: string; handle: string; photo_url: string | null; bio: string | null; publicationUsers?: Array<{ publication: SubstackPublication; role: string }> }>(
    `https://substack.com/api/v1/user/${ENV_HANDLE}/public_profile`, ENV_COOKIES
  );
}

export async function getDashboardData() {
  const safe = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
    p.catch(() => fallback);

  const [publication, profile, posts, topPosts] = await Promise.all([
    safe(getPublication(), null),
    safe(getProfile(), null),
    safe(getPosts(50), []),
    safe(getArchive("top", 10), []),
  ]);

  const totalReactions = (posts ?? []).reduce((sum, p) =>
    sum + Object.values(p.reactions ?? {}).reduce((s, v) => s + v, 0), 0);
  const totalRestacks = (posts ?? []).reduce((sum, p) => sum + (p.restacks ?? 0), 0);

  const topPost = [...(posts ?? [])].sort((a, b) => {
    const ra = Object.values(a.reactions ?? {}).reduce((s, v) => s + v, 0);
    const rb = Object.values(b.reactions ?? {}).reduce((s, v) => s + v, 0);
    return rb - ra;
  })[0] ?? null;

  const topPostReactions = topPost
    ? Object.values(topPost.reactions ?? {}).reduce((s, v) => s + v, 0) : 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentPosts = (posts ?? []).filter(p => new Date(p.post_date).getTime() > thirtyDaysAgo).length;
  const paidPosts = (posts ?? []).filter(p => p.audience === "only_paid").length;

  return {
    publication, profile, posts: posts ?? [], topPosts: topPosts ?? [],
    stats: {
      totalPosts: (posts ?? []).length, totalReactions, totalRestacks,
      avgReactionsPerPost: (posts ?? []).length ? Math.round(totalReactions / (posts ?? []).length) : 0,
      topPost, topPostReactions, recentPosts, paidPosts,
    },
  };
}


// ─── Types used by components ────────────────────────────────────────────────

export interface SubstackPostDetail extends SubstackPost {
  body_html: string | null;
  truncated_body_text: string | null;
  type: string;
  postTags: Array<{ id: number; name: string; slug: string }> | null;
}

export interface SubstackComment {
  id: number;
  body: string;
  date: string;
  author_is_admin: boolean;
  name?: string;
  handle?: string;
  photo_url?: string | null;
}

export interface DashboardData {
  publication: SubstackPublication | null;
  profile: Awaited<ReturnType<typeof getProfile>>;
  posts: SubstackPost[];
  topPosts: SubstackPost[];
  stats: {
    totalPosts: number;
    totalReactions: number;
    totalRestacks: number;
    avgReactionsPerPost: number;
    topPost: SubstackPost | null;
    topPostReactions: number;
    recentPosts: number;
    paidPosts: number;
  };
}

// ─── Per-post detail endpoints (env-based) ───────────────────────────────────

export async function getPostDetail(slug: string): Promise<SubstackPostDetail | null> {
  return apiFetch<SubstackPostDetail>(
    `https://${ENV_PUB}.substack.com/api/v1/posts/${slug}`, ENV_COOKIES
  );
}

export async function getPostComments(postId: number): Promise<SubstackComment[]> {
  const data = await apiFetch<{ comments: SubstackComment[] }>(
    `https://${ENV_PUB}.substack.com/api/v1/post/${postId}/comments`, ENV_COOKIES
  );
  return data?.comments ?? [];
}

export function computePostMeta(post: SubstackPostDetail) {
  const html = post.body_html ?? post.truncated_body_text ?? "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(" ").filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const totalReactions = Object.values(post.reactions ?? {}).reduce((s, v) => s + v, 0);
  return { wordCount, readingTime, totalReactions };
}
