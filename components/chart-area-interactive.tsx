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

const chartData = [
  { date: "2024-04-01", subscribers: 3800, paid: 210 },
  { date: "2024-04-08", subscribers: 3860, paid: 215 },
  { date: "2024-04-15", subscribers: 3910, paid: 220 },
  { date: "2024-04-22", subscribers: 4050, paid: 228 },
  { date: "2024-04-29", subscribers: 4120, paid: 235 },
  { date: "2024-05-06", subscribers: 4180, paid: 241 },
  { date: "2024-05-13", subscribers: 4310, paid: 250 },
  { date: "2024-05-20", subscribers: 4290, paid: 252 },
  { date: "2024-05-27", subscribers: 4380, paid: 260 },
  { date: "2024-06-03", subscribers: 4440, paid: 268 },
  { date: "2024-06-10", subscribers: 4510, paid: 275 },
  { date: "2024-06-17", subscribers: 4620, paid: 283 },
  { date: "2024-06-24", subscribers: 4700, paid: 290 },
  { date: "2024-07-01", subscribers: 4760, paid: 298 },
  { date: "2024-07-08", subscribers: 4821, paid: 305 },
]

const chartConfig = {
  subscribers: {
    label: "Free Subscribers",
    color: "var(--accent-orange)",
  },
  paid: {
    label: "Paid Subscribers",
    color: "#ffffff",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("30d")
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const refDate = new Date("2024-07-08")
    const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const start = new Date(refDate)
    start.setDate(start.getDate() - days)
    return date >= start
  })

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
            Subscriber Growth
          </CardTitle>
          <CardDescription style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}>
            Free and paid subscribers over time
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => setTimeRange(value[0] ?? "90d")}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-3! *:data-[slot=toggle-group-item]:text-xs @[540px]/card:flex"
            style={{ gap: "4px" }}
          >
            {["90d", "30d", "7d"].map((v) => (
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
                {v === "90d" ? "3 months" : v === "30d" ? "30 days" : "7 days"}
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
              style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: "var(--surface-strong)" }}>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-4 sm:pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={filteredData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="fillSubs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillPaid" x1="0" y1="0" x2="0" y2="1">
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
                    new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="subscribers"
              type="monotone"
              fill="url(#fillSubs)"
              stroke="var(--accent-orange)"
              strokeWidth={2}
            />
            <Area
              dataKey="paid"
              type="monotone"
              fill="url(#fillPaid)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
