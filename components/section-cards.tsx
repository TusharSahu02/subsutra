"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
  HeartIcon,
  Repeat2Icon,
  ZapIcon,
} from "lucide-react"
import type { DashboardData } from "@/lib/substack"

interface Props {
  stats: DashboardData["stats"]
  topPost: DashboardData["stats"]["topPost"]
}

export function SectionCards({ stats, topPost }: Props) {
  const cards = [
    {
      label: "Total Posts",
      value: stats.totalPosts.toString(),
      delta: `+${stats.recentPosts}`,
      deltaLabel: "published last 30 days",
      trend: "up" as const,
      sub: `${stats.paidPosts} paid-only · ${stats.totalPosts - stats.paidPosts} free`,
      icon: FileTextIcon,
    },
    {
      label: "Total Reactions",
      value: stats.totalReactions.toLocaleString(),
      delta: `~${stats.avgReactionsPerPost}`,
      deltaLabel: "avg per post",
      trend: stats.avgReactionsPerPost > 0 ? ("up" as const) : ("down" as const),
      sub: "❤  across all published posts",
      icon: HeartIcon,
    },
    {
      label: "Total Restacks",
      value: stats.totalRestacks.toLocaleString(),
      delta: stats.totalRestacks > 0 ? `+${stats.totalRestacks}` : "0",
      deltaLabel: "all time",
      trend: stats.totalRestacks > 0 ? ("up" as const) : ("down" as const),
      sub: "Shares by other Substack writers",
      icon: Repeat2Icon,
    },
    {
      label: "Top Post",
      value: stats.topPostReactions > 0 ? `${stats.topPostReactions} ❤` : "—",
      delta: stats.topPostReactions > 0 ? "Most reacted" : "No data",
      deltaLabel: "post performance",
      trend: stats.topPostReactions > 0 ? ("up" as const) : ("down" as const),
      sub: topPost?.title ?? "No posts yet",
      icon: ZapIcon,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            className="@container/card border-0"
            style={{
              backgroundColor: "var(--surface-raised)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <CardHeader>
              <CardDescription
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-secondary)" }}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {card.label}
              </CardDescription>
              <CardTitle
                className="text-3xl font-semibold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className="gap-1 border-0 text-xs"
                  style={{
                    backgroundColor:
                      card.trend === "up"
                        ? "rgba(255,103,25,0.12)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      card.trend === "up"
                        ? "var(--accent-orange)"
                        : "var(--text-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "2px 8px",
                  }}
                >
                  {card.trend === "up" ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  {card.delta}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1">
              <div
                className="text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {card.deltaLabel}
              </div>
              <div
                className="line-clamp-1 text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.sub}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
