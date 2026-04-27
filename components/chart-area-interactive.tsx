"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { SubstackPost } from "@/lib/substack"

interface ChartPoint {
  date: string
  reactions: number
  restacks: number
}

function buildChartData(posts: SubstackPost[]): ChartPoint[] {
  return [...posts]
    .filter((p) => p.is_published)
    .sort((a, b) => new Date(a.post_date).getTime() - new Date(b.post_date).getTime())
    .map((p) => ({
      date: p.post_date.slice(0, 10),
      reactions: Object.values(p.reactions ?? {}).reduce((s, v) => s + v, 0),
      restacks: p.restacks ?? 0,
    }))
}

const chartConfig = {
  reactions: {
    label: "Reactions",
    color: "var(--accent-orange)",
  },
  restacks: {
    label: "Restacks",
    color: "#ffffff",
  },
} satisfies ChartConfig

interface Props {
  posts: SubstackPost[]
}

export function ChartAreaInteractive({ posts }: Props) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("all")

  React.useEffect(() => {
    if (isMobile) setTimeRange("90d")
  }, [isMobile])

  const allData = React.useMemo(() => buildChartData(posts), [posts])

  const filteredData = React.useMemo(() => {
    if (timeRange === "all" || allData.length === 0) return allData
    const days = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return allData.filter((d) => new Date(d.date).getTime() >= cutoff)
  }, [allData, timeRange])

  const ranges = ["all", "365d", "90d", "30d"] as const
  const rangeLabel: Record<string, string> = {
    all: "All time",
    "365d": "1 year",
    "90d": "3 months",
    "30d": "30 days",
  }

  return (
    <Card
      className="@container/card border-0"
      style={{ backgroundColor: "var(--surface-raised)", borderRadius: "var(--radius-sm)" }}
    >
      <CardHeader>
        <div>
          <CardTitle
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Post Engagement
          </CardTitle>
          <CardDescription
            style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}
          >
            Reactions and restacks per published post
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => setTimeRange(value[0] ?? "all")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-3! *:data-[slot=toggle-group-item]:text-xs @[540px]/card:flex"
            style={{ gap: "4px" }}
          >
            {ranges.map((v) => (
              <ToggleGroupItem
                key={v}
                value={v}
                style={{
                  fontSize: "var(--font-size-xs)",
                  borderRadius: "var(--radius-xs)",
                  borderColor: "var(--border-subtle)",
                  color: timeRange === v ? "var(--accent-orange)" : "var(--text-secondary)",
                  backgroundColor: timeRange === v ? "rgba(255,103,25,0.1)" : "transparent",
                }}
              >
                {rangeLabel[v]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(v) => { if (v) setTimeRange(v) }}
          >
            <SelectTrigger
              className="w-36 text-xs @[540px]/card:hidden"
              size="sm"
              aria-label="Select time range"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
                fontSize: "var(--font-size-xs)",
              }}
            >
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--surface-strong)" }}>
              {ranges.map((v) => (
                <SelectItem key={v} value={v}>{rangeLabel[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-4 sm:pt-4">
        {filteredData.length === 0 ? (
          <div
            className="flex h-[220px] items-center justify-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            No published posts in this range
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
            <AreaChart
              data={filteredData}
              margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillReactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillRestacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis hide />
              <ChartTooltip
                cursor={{ stroke: "var(--border-subtle)", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="reactions"
                type="monotone"
                fill="url(#fillReactions)"
                stroke="var(--accent-orange)"
                strokeWidth={2}
              />
              <Area
                dataKey="restacks"
                type="monotone"
                fill="url(#fillRestacks)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
