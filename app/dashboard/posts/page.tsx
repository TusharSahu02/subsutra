import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { getPosts } from "@/lib/substack"
import { HeartIcon, Repeat2Icon, MessageSquareIcon, ExternalLinkIcon, ClockIcon } from "lucide-react"

function engagementScore(reactions: number, restacks: number, comments: number) {
  return reactions * 3 + restacks * 5 + comments * 2
}

function gradeLetter(score: number, max: number): { grade: string; color: string } {
  if (max === 0) return { grade: "—", color: "var(--text-secondary)" }
  const pct = score / max
  if (pct >= 0.8) return { grade: "A+", color: "var(--accent-orange)" }
  if (pct >= 0.6) return { grade: "A",  color: "var(--accent-orange)" }
  if (pct >= 0.4) return { grade: "B",  color: "#4ade80" }
  if (pct >= 0.2) return { grade: "C",  color: "#facc15" }
  return { grade: "D", color: "var(--text-secondary)" }
}

export default async function PostsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = {
    name: session.user.name ?? "Creator",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
  }

  const posts = await getPosts(50)
  const published = posts.filter((p) => p.is_published)

  const withScores = published.map((p) => {
    const reactions = Object.values(p.reactions ?? {}).reduce((s, v) => s + v, 0)
    const score = engagementScore(reactions, p.restacks ?? 0, 0)
    return { ...p, reactions, score }
  })

  const maxScore = Math.max(...withScores.map((p) => p.score), 1)
  const sorted = [...withScores].sort((a, b) => b.score - a.score)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-6">

          {/* header row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Post Performance
              </h1>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                {published.length} published posts — sorted by engagement score
              </p>
            </div>
          </div>

          {/* legend */}
          <div
            className="flex flex-wrap gap-4 rounded-xl border p-4 text-xs"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Score = reactions×3 + restacks×5 + comments×2</span>
            <span className="flex items-center gap-1" style={{ color: "var(--accent-orange)" }}>
              <HeartIcon className="size-3" /> reactions
            </span>
            <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              <Repeat2Icon className="size-3" /> restacks
            </span>
            <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              <MessageSquareIcon className="size-3" /> comments
            </span>
          </div>

          {/* posts list */}
          <div className="flex flex-col gap-3">
            {sorted.map((post, idx) => {
              const { grade, color } = gradeLetter(post.score, maxScore)
              const date = new Date(post.post_date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })
              const barWidth = maxScore > 0 ? Math.round((post.score / maxScore) * 100) : 0

              return (
                <Link
                  key={post.id}
                  href={`/dashboard/posts/${post.slug}`}
                  className="group block rounded-xl border p-4 transition-colors hover:border-orange-500/30"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-raised)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* rank */}
                    <span
                      className="w-6 shrink-0 pt-0.5 text-center text-xs tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {idx + 1}
                    </span>

                    {/* grade */}
                    <span
                      className="w-8 shrink-0 text-center text-lg font-bold tabular-nums"
                      style={{ color }}
                    >
                      {grade}
                    </span>

                    {/* main content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="line-clamp-1 text-sm font-medium group-hover:underline"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {post.title}
                        </p>
                        <ExternalLinkIcon
                          className="mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>

                      {/* meta row */}
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          <ClockIcon className="size-3" /> {date}
                        </span>
                        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: "var(--accent-orange)" }}>
                          <HeartIcon className="size-3" /> {post.reactions}
                        </span>
                        <span className="flex items-center gap-1 text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                          <Repeat2Icon className="size-3" /> {post.restacks ?? 0}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-0 px-1.5 text-xs"
                          style={{
                            backgroundColor: post.audience === "only_paid"
                              ? "rgba(255,103,25,0.12)"
                              : "rgba(255,255,255,0.06)",
                            color: post.audience === "only_paid"
                              ? "var(--accent-orange)"
                              : "var(--text-secondary)",
                          }}
                        >
                          {post.audience === "only_paid" ? "Paid" : "Free"}
                        </Badge>
                        {post.type !== "newsletter" && (
                          <Badge
                            variant="outline"
                            className="border-0 px-1.5 text-xs capitalize"
                            style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
                          >
                            {post.type}
                          </Badge>
                        )}
                      </div>

                      {/* engagement bar */}
                      <div
                        className="mt-2 h-1 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: idx === 0 ? "var(--accent-orange)" : "rgba(255,103,25,0.4)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {sorted.length === 0 && (
              <p className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                No published posts found.
              </p>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
