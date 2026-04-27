import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { getPostDetail, getPostComments, computePostMeta } from "@/lib/substack"
import {
  HeartIcon,
  Repeat2Icon,
  MessageSquareIcon,
  ClockIcon,
  FileTextIcon,
  TagIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
} from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PostDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { slug } = await params

  const user = {
    name: session.user.name ?? "Creator",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
  }

  const [post, comments] = await Promise.all([
    getPostDetail(slug),
    // We need the post id — fetch post first, then comments in parallel below
    Promise.resolve([] as Awaited<ReturnType<typeof getPostComments>>),
  ])

  if (!post) notFound()

  // Now fetch comments with the real post id
  const postComments = await getPostComments(post.id)
  const { wordCount, readingTime, totalReactions } = computePostMeta(post)
  const engagementScore = totalReactions * 3 + (post.restacks ?? 0) * 5 + postComments.length * 2

  const publishDate = new Date(post.post_date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })

  const tags = post.postTags ?? []

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

          {/* back link */}
          <Link
            href="/dashboard/posts"
            className="flex w-fit items-center gap-1.5 text-xs transition-colors hover:text-orange-400"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeftIcon className="size-3" />
            Back to Post Performance
          </Link>

          {/* title block */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-0 px-2 py-0.5 text-xs"
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
              <Badge
                variant="outline"
                className="border-0 px-2 py-0.5 text-xs capitalize"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
              >
                {post.type}
              </Badge>
            </div>

            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3" /> {publishDate}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="size-3" /> {readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <FileTextIcon className="size-3" /> {wordCount.toLocaleString()} words
              </span>
              <a
                href={post.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-orange-400"
              >
                <ExternalLinkIcon className="size-3" /> View on Substack
              </a>
            </div>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: HeartIcon,
                label: "Reactions",
                value: totalReactions,
                accent: true,
              },
              {
                icon: Repeat2Icon,
                label: "Restacks",
                value: post.restacks ?? 0,
                accent: false,
              },
              {
                icon: MessageSquareIcon,
                label: "Comments",
                value: postComments.length,
                accent: false,
              },
              {
                icon: TagIcon,
                label: "Engagement Score",
                value: engagementScore,
                accent: false,
              },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-xl border p-4"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-raised)",
                }}
              >
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <Icon className="size-3.5" />
                  {label}
                </div>
                <p
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: accent ? "var(--accent-orange)" : "var(--text-primary)" }}
                >
                  {value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* tags */}
          {tags.length > 0 && (
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                <TagIcon className="size-3.5" /> Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="border-0 px-2.5 py-1 text-xs"
                    style={{ backgroundColor: "rgba(255,103,25,0.1)", color: "var(--accent-orange)" }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* post body preview */}
          {(post.body_html || post.truncated_body_text) && (
            <div
              className="rounded-xl border p-5"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                Content Preview
              </p>
              {post.body_html ? (
                <div
                  className="prose prose-sm max-w-none prose-invert line-clamp-[12] text-sm leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                  dangerouslySetInnerHTML={{ __html: post.body_html }}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {post.truncated_body_text}
                </p>
              )}
              <a
                href={post.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1 text-xs transition-colors hover:text-orange-400"
                style={{ color: "var(--text-secondary)" }}
              >
                Read full post on Substack <ExternalLinkIcon className="size-3" />
              </a>
            </div>
          )}

          {/* comments */}
          <div
            className="rounded-xl border"
            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}
          >
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
                <MessageSquareIcon className="size-3.5" /> Comments
              </p>
              <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {postComments.length}
              </span>
            </div>

            {postComments.length === 0 ? (
              <p className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                No comments yet.
              </p>
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {postComments.map((c) => (
                  <li key={c.id} className="flex gap-3 p-4">
                    {/* avatar placeholder */}
                    <div
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs"
                      style={{
                        backgroundColor: "rgba(255,103,25,0.12)",
                        color: "var(--accent-orange)",
                      }}
                    >
                      {c.name ? c.name[0].toUpperCase() : <UserIcon className="size-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {c.name ?? (c.author_is_admin ? "Author" : "Reader")}
                        </span>
                        {c.author_is_admin && (
                          <Badge
                            variant="outline"
                            className="border-0 px-1.5 py-0 text-xs"
                            style={{ backgroundColor: "rgba(255,103,25,0.1)", color: "var(--accent-orange)" }}
                          >
                            Author
                          </Badge>
                        )}
                        {c.date && (
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {c.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
