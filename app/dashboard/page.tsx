import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { PostsTable } from "@/components/posts-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardData, type DashboardData } from "@/lib/substack"

export default async function Page() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = {
    name: session.user.name ?? "Creator",
    email: session.user.email ?? "",
    avatar: session.user.image ?? "",
  }

  const dashboard = await getDashboardData().catch(() => ({
    publication: null, profile: null, posts: [], topPosts: [],
    stats: { totalPosts: 0, totalReactions: 0, totalRestacks: 0, avgReactionsPerPost: 0, topPost: null, topPostReactions: 0, recentPosts: 0, paidPosts: 0 },
  }))

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards stats={dashboard.stats} topPost={dashboard.stats.topPost} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive posts={dashboard.posts} />
              </div>
              <PostsTable posts={dashboard.posts} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
