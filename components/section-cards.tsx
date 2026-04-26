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
import { TrendingUpIcon, TrendingDownIcon, UsersIcon, MailOpenIcon, ArrowUpRightIcon, ZapIcon } from "lucide-react"

const cards = [
  {
    label: "Total Subscribers",
    value: "4,821",
    delta: "+312",
    deltaLabel: "+6.9% this month",
    trend: "up",
    sub: "Gained 312 new subscribers",
    icon: UsersIcon,
  },
  {
    label: "Avg Open Rate",
    value: "38.4%",
    delta: "+2.1%",
    deltaLabel: "vs. last 30 days",
    trend: "up",
    sub: "Above 34% niche average",
    icon: MailOpenIcon,
  },
  {
    label: "Free → Paid",
    value: "1.8%",
    delta: "-0.3%",
    deltaLabel: "vs. last month",
    trend: "down",
    sub: "3 conversions this week",
    icon: ArrowUpRightIcon,
  },
  {
    label: "Top Post Score",
    value: "A+",
    delta: "94 / 100",
    deltaLabel: "Post performance",
    trend: "up",
    sub: '"My Creator Journey" — published Apr 21',
    icon: ZapIcon,
  },
]

export function SectionCards() {
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
                    backgroundColor: card.trend === "up"
                      ? "rgba(255,103,25,0.12)"
                      : "rgba(255,255,255,0.06)",
                    color: card.trend === "up"
                      ? "var(--accent-orange)"
                      : "var(--text-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "2px 8px",
                  }}
                >
                  {card.trend === "up"
                    ? <TrendingUpIcon className="size-3" />
                    : <TrendingDownIcon className="size-3" />}
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
                className="text-xs leading-relaxed line-clamp-1"
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
