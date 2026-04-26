import Link from "next/link"

const releases = [
  {
    version: "1.0.0",
    date: "April 27, 2026",
    tag: "Launch",
    tagColor: "#ff6719",
    title: "V1 — SubSutra is live",
    summary: "Four core analytics features that answer the questions Substack's native dashboard never could.",
    changes: [
      {
        type: "new",
        items: [
          "Post Performance Scorer — every post graded A–F using open rate (30%), CTR (20%), subscriber gain (30%), and restacks (20%)",
          "Subscriber Growth Timeline — interactive chart with spike annotations linking growth events to the posts that caused them",
          "Best Day & Time to Publish — personalized heatmap built from your own audience's open behavior, not generic advice",
          "Free → Paid Conversion Tracker — ranks posts by conversion impact within 72 hours of publish",
        ],
      },
      {
        type: "infra",
        items: [
          "Google OAuth sign-in — one-click login, no password to manage",
          "Neon PostgreSQL database — subscriber events, post metrics, and conversion data stored securely",
          "Substack session connect — encrypted token storage, read-only access, never stores raw credentials",
        ],
      },
    ],
  },
]

const upcomingReleases = [
  {
    version: "2.0.0",
    eta: "~Week 11",
    title: "V2 — Growth Features",
    tag: "Upcoming",
    changes: [
      "Notes Performance Tracker — impressions, likes, restacks, and subscriber conversions per Note",
      "Churn & Retention Monitor — real-time unsubscribe rate alerts when you spike above 2× your average",
      "Audience Overlap Intelligence — see which other Substacks your readers follow, with collaboration scores",
      "Weekly AI Growth Report — every Monday, 3 specific action items based on your data",
    ],
  },
  {
    version: "3.0.0",
    eta: "~Week 18",
    title: "V3 — Premium Intelligence",
    tag: "Planned",
    changes: [
      "Revenue Intelligence Dashboard — MRR, LTV, churn rate, and a 3-month revenue forecast",
      "Content Topic Analyzer — AI clusters your posts by topic and maps each cluster to performance",
      "Competitor Benchmarking — your open rate vs. anonymized niche averages (5+ niches at launch)",
    ],
  },
]

const typeLabel: Record<string, { label: string; color: string; bg: string }> = {
  new:   { label: "New",   color: "#ff6719", bg: "rgba(255,103,25,0.1)" },
  infra: { label: "Infra", color: "#aaaaaa", bg: "rgba(255,255,255,0.06)" },
  fix:   { label: "Fix",   color: "#28c840", bg: "rgba(40,200,64,0.1)" },
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#000", color: "#eee" }}>

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="SubSutra">
            <circle cx="10" cy="10" r="10" fill="#ff6719" />
            <path d="M6 10l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-sm tracking-tight" style={{ color: "#eee" }}>SubSutra</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "#777" }}>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/changelog" className="text-white">Changelog</Link>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#ff6719", color: "#000" }}
        >
          Start free
        </Link>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-12 px-6 max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border mb-6"
          style={{ backgroundColor: "rgba(255,103,25,0.08)", borderColor: "rgba(255,103,25,0.2)", color: "#ff6719" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Updated April 27, 2026
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#fff" }}>Changelog</h1>
        <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
          Every release, documented. SubSutra ships fast — this is the record.
        </p>
      </div>

      {/* Timeline */}
      <div className="px-6 max-w-2xl mx-auto pb-24">
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-2 bottom-0 w-px"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          />

          {/* Live releases */}
          {releases.map((release) => (
            <div key={release.version} className="relative pl-10 mb-16">
              {/* Dot */}
              <div
                className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-black"
                style={{ backgroundColor: release.tagColor }}
              />

              {/* Meta */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,103,25,0.12)", color: "#ff6719" }}
                >
                  {release.tag}
                </span>
                <span className="text-xs font-mono" style={{ color: "#555" }}>v{release.version}</span>
                <span className="text-xs" style={{ color: "#444" }}>{release.date}</span>
              </div>

              <h2 className="text-lg font-bold mb-2" style={{ color: "#fff" }}>{release.title}</h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#666" }}>{release.summary}</p>

              {release.changes.map((group) => {
                const t = typeLabel[group.type]
                return (
                  <div key={group.type} className="mb-5">
                    <span
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-3"
                      style={{ backgroundColor: t.bg, color: t.color }}
                    >
                      {t.label}
                    </span>
                    <ul className="flex flex-col gap-2.5">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#bbb" }}>
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Upcoming releases */}
          {upcomingReleases.map((release) => (
            <div key={release.version} className="relative pl-10 mb-14 opacity-50">
              {/* Hollow dot */}
              <div
                className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "#000" }}
              />

              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#777" }}
                >
                  {release.tag}
                </span>
                <span className="text-xs font-mono" style={{ color: "#444" }}>v{release.version}</span>
                <span className="text-xs" style={{ color: "#333" }}>ETA {release.eta}</span>
              </div>

              <h2 className="text-lg font-bold mb-2" style={{ color: "#888" }}>{release.title}</h2>

              <ul className="flex flex-col gap-2.5">
                {release.changes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#555" }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "#444" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Bottom cap */}
          <div className="relative pl-10">
            <div
              className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#000" }}
            />
            <p className="text-xs" style={{ color: "#333" }}>More features planned. Ship fast, learn faster.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ff6719" />
              <path d="M6 10l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "#555" }}>SubSutra</span>
          </div>
          <p className="text-xs" style={{ color: "#333" }}>© 2026 SubSutra · Built for Substack creators</p>
        </div>
      </footer>
    </div>
  )
}
