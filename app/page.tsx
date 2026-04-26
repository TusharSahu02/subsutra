"use client"

import * as React from "react"
import Link from "next/link"

/* ─── Animated counter hook ─────────────────────────────────────────────── */
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    if (!start) return
    let raf: number
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(ease * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return value
}

/* ─── Intersection observer hook ────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ─── Sparkline SVG ──────────────────────────────────────────────────────── */
function Sparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data)
  const w = 120
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2
    return `${x},${y}`
  }).join(" ")
  const area = `M0,${height} ` + data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((v - min) / (max - min || 1)) * (height - 4) - 2
    return `L${x},${y}`
  }).join(" ") + ` L${w},${height} Z`
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Mini post score badge ──────────────────────────────────────────────── */
function GradeBadge({ grade, delay }: { grade: string; delay: number }) {
  const colors: Record<string, string> = { A: "#ff6719", B: "#ffac80", C: "#aaaaaa", D: "#555", F: "#333" }
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-transform hover:scale-110"
      style={{
        backgroundColor: colors[grade] ?? "#333",
        color: grade === "A" ? "#000" : "#fff",
        animationDelay: `${delay}ms`,
      }}
    >
      {grade}
    </span>
  )
}

/* ─── Floating stat card ─────────────────────────────────────────────────── */
function FloatCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute rounded-xl border px-3 py-2.5 text-xs backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: "rgba(22,23,24,0.92)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Pricing card ───────────────────────────────────────────────────────── */
function PricingCard({
  plan, price, annual, desc, features, accent, featured,
}: {
  plan: string; price: number; annual: number; desc: string
  features: string[]; accent: boolean; featured: boolean
}) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      className="relative flex flex-col rounded-2xl p-6 border transition-all duration-300 cursor-default"
      style={{
        backgroundColor: featured ? "rgba(255,103,25,0.06)" : "rgba(22,23,24,0.7)",
        borderColor: featured ? "rgba(255,103,25,0.4)" : hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: featured ? "0 0 40px rgba(255,103,25,0.12)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {featured && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-0.5 rounded-full"
          style={{ backgroundColor: "#ff6719", color: "#000" }}
        >
          Most Popular
        </div>
      )}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent ? "#ff6719" : "#777" }}>{plan}</p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold" style={{ color: "#eee" }}>${price}</span>
          <span className="text-sm mb-1" style={{ color: "#777" }}>/mo</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#555" }}>${annual}/yr · saves 30%</p>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: "#aaa" }}>{desc}</p>
      </div>
      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#ccc" }}>
            <span style={{ color: "#ff6719", marginTop: 2 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href="/login"
        className="block text-center text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{
          backgroundColor: featured ? "#ff6719" : "rgba(255,255,255,0.07)",
          color: featured ? "#000" : "#eee",
          border: featured ? "none" : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        Start free trial
      </a>
    </div>
  )
}

/* ─── Animated metric row ────────────────────────────────────────────────── */
function MetricRow({ label, value, bar, color, delay }: { label: string; value: string; bar: number; color: string; delay: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs" style={{ color: "#777" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "#eee" }}>{value}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            backgroundColor: color,
            width: inView ? `${bar}%` : "0%",
            transitionDuration: "1s",
            transitionDelay: `${delay}ms`,
            transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = React.useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [mousePos, setMousePos] = React.useState({ x: 0.5, y: 0.5 })
  const [activeFeature, setActiveFeature] = React.useState(0)
  const statsRef = React.useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = React.useState(false)

  const subs = useCounter(4821, 1800, statsVisible)
  const opens = useCounter(38, 1600, statsVisible)
  const posts = useCounter(127, 2000, statsVisible)

  React.useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  React.useEffect(() => {
    const interval = setInterval(() => setActiveFeature(f => (f + 1) % 4), 3000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    setMousePos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
  }, [])

  const features = [
    {
      title: "Post Performance Scorer",
      tag: "V1",
      desc: "Every post graded A–F using open rate, CTR, subscriber gain, and restacks. Know exactly which posts resonated.",
      visual: (
        <div className="flex flex-col gap-2 p-4">
          <div className="flex gap-1 mb-2">
            {["A", "A", "B", "A", "C", "B", "F", "A"].map((g, i) => <GradeBadge key={i} grade={g} delay={i * 60} />)}
          </div>
          {[
            { title: "My Creator Journey", grade: "A", score: 94, open: "42%", subs: "+48" },
            { title: "10 Tools I Use Daily", grade: "A", score: 88, open: "39%", subs: "+31" },
            { title: "Hot Take on AI", grade: "B", score: 71, open: "31%", subs: "+12" },
            { title: "Quick Update", grade: "C", score: 52, open: "22%", subs: "+3" },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <GradeBadge grade={p.grade} delay={i * 80} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "#eee" }}>{p.title}</p>
                <p className="text-xs" style={{ color: "#555" }}>Opens {p.open} · {p.subs} subs</p>
              </div>
              <div className="text-xs font-bold tabular-nums" style={{ color: "#ff6719" }}>{p.score}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Subscriber Growth Timeline",
      tag: "V1",
      desc: "Interactive chart with spike annotations. Click any growth spike to see which post caused it.",
      visual: (
        <div className="flex flex-col gap-3 p-4">
          <div className="relative h-24">
            <Sparkline data={[3800, 3860, 3910, 4050, 4120, 4180, 4310, 4290, 4380, 4440, 4510, 4620, 4700, 4760, 4821]} color="#ff6719" height={96} />
            <FloatCard style={{ top: "10%", left: "58%", transform: "translateX(-50%)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span style={{ color: "#ff6719" }}>+140 subs</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#777" }}>"Behind the Scenes" post</p>
            </FloatCard>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "All"].map((t, i) => (
              <button key={t} className="text-xs px-2.5 py-1 rounded-lg transition-colors" style={{
                backgroundColor: i === 2 ? "rgba(255,103,25,0.15)" : "rgba(255,255,255,0.04)",
                color: i === 2 ? "#ff6719" : "#555",
              }}>{t}</button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Best Day & Time to Publish",
      tag: "V1",
      desc: "A personalized heatmap built from your own audience's open behavior. Not generic advice — your data.",
      visual: (
        <div className="p-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(7, 1fr)" }}>
            <div />
            {["M","T","W","T","F","S","S"].map((d,i) => (
              <div key={i} className="text-center text-xs pb-1" style={{ color: "#555" }}>{d}</div>
            ))}
            {["6am","9am","12pm","3pm","6pm","9pm"].map((hr) => (
              <React.Fragment key={hr}>
                <div className="text-xs pr-2 leading-4" style={{ color: "#555" }}>{hr}</div>
                {[0.1,0.2,0.7,0.4,0.3,0.1,0.05,
                  0.2,0.9,0.95,0.6,0.4,0.15,0.1,
                  0.15,0.5,0.6,0.7,0.5,0.2,0.1,
                  0.1,0.3,0.4,0.5,0.4,0.15,0.05,
                  0.05,0.2,0.3,0.3,0.25,0.1,0.05,
                  0.05,0.1,0.15,0.2,0.15,0.05,0.02,
                ].slice(["6am","9am","12pm","3pm","6pm","9pm"].indexOf(hr)*7, ["6am","9am","12pm","3pm","6pm","9pm"].indexOf(hr)*7+7).map((v,ci) => (
                  <div key={ci} className="rounded-sm aspect-square transition-transform hover:scale-110" style={{
                    backgroundColor: `rgba(255,103,25,${v})`,
                    outline: v > 0.8 ? "1px solid rgba(255,103,25,0.5)" : "none",
                  }} />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-3 text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,103,25,0.1)", color: "#ff6719" }}>
            ★ Best time: Tuesday 9am — avg 39.4% open rate
          </div>
        </div>
      ),
    },
    {
      title: "Free → Paid Conversion Tracker",
      tag: "V1",
      desc: "Which posts are turning free readers into paying subscribers? Ranked by conversion impact within 72 hours.",
      visual: (
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: "#777" }}>Conversion funnel</span>
            <span style={{ color: "#ff6719" }}>last 30 days</span>
          </div>
          {[
            { label: "Free subscribers", count: "4,516", pct: 100, color: "rgba(255,255,255,0.15)" },
            { label: "Post opens", count: "1,734", pct: 38, color: "rgba(255,103,25,0.3)" },
            { label: "Clicked paywall CTA", count: "312", pct: 7, color: "rgba(255,103,25,0.6)" },
            { label: "Converted to paid", count: "81", pct: 1.8, color: "#ff6719" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#aaa" }}>{row.label}</span>
                <span style={{ color: "#eee" }}>{row.count}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
              </div>
            </div>
          ))}
          <div className="text-xs mt-1 px-2 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,103,25,0.08)", color: "#ff6719" }}>
            Top converter: "Behind the Scenes" — 12 upgrades in 72h
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#000", color: "#eee" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="SubSutra">
            <circle cx="10" cy="10" r="10" fill="#ff6719" />
            <path d="M6 10l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-sm tracking-tight" style={{ color: "#eee" }}>SubSutra</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "#777" }}>
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Changelog", href: "/changelog" },
          ].map(l => (
            <a key={l.label} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
          ))}
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#ff6719", color: "#000" }}
        >
          Start free
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
        onMouseMove={handleMouseMove}
      >
        {/* Radial glow that follows cursor */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(800px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,103,25,0.07) 0%, transparent 70%)`,
          }}
        />
        {/* Static center glow */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(60% 50% at 50% 60%, rgba(255,103,25,0.05) 0%, transparent 100%)",
        }} />
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

        <div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          {/* Pill badge */}
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-8 border"
            style={{
              backgroundColor: "rgba(255,103,25,0.08)",
              borderColor: "rgba(255,103,25,0.2)",
              color: "#ff6719",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            V1 now live — 4 creator analytics features
          </div>

          {/* Headline */}
          <h1
            className="font-bold leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#fff" }}
          >
            Your Substack is growing.<br />
            <span style={{ color: "#ff6719" }}>Do you know why?</span>
          </h1>

          <p
            className="text-base leading-relaxed max-w-xl mb-10"
            style={{ color: "#777", fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
          >
            SubSutra connects to your Substack and automatically surfaces which posts drive growth, when your audience opens emails, and who's converting to paid — no spreadsheets required.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-16">
            <Link
              href="/login"
              className="group flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#ff6719", color: "#000", fontSize: "0.9rem" }}
            >
              Start free — no credit card
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </Link>
            <span className="text-sm" style={{ color: "#444" }}>14-day trial · all V1 features</span>
          </div>

          {/* Hero dashboard preview */}
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: "rgba(22,23,24,0.9)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />)}
              <div className="mx-auto text-xs px-20 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#555" }}>
                subsutra.app/dashboard
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Subscribers", value: "4,821", delta: "+312", up: true },
                { label: "Open Rate", value: "38.4%", delta: "+2.1%", up: true },
                { label: "Free → Paid", value: "1.8%", delta: "-0.3%", up: false },
                { label: "Top Grade", value: "A+", delta: "94/100", up: true },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl p-3 border"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <p className="text-xs mb-1" style={{ color: "#555" }}>{card.label}</p>
                  <p className="text-xl font-bold" style={{ color: "#fff" }}>{card.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: card.up ? "#ff6719" : "#666" }}>{card.delta}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div
                className="rounded-xl p-3 border"
                style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: "#eee" }}>Subscriber Growth</p>
                  <div className="flex gap-4 text-xs" style={{ color: "#555" }}>
                    <span className="flex items-center gap-1"><span className="w-2 h-px inline-block" style={{ backgroundColor: "#ff6719" }} /> Free</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-px inline-block border-t border-dashed border-white/40" /> Paid</span>
                  </div>
                </div>
                <div className="h-16">
                  <Sparkline data={[3800,3860,3910,4050,4120,4180,4310,4290,4380,4440,4510,4620,4700,4760,4821]} color="#ff6719" height={64} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce"
          style={{ color: "#333" }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <div
        ref={statsRef}
        className="py-12 border-y"
        style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(22,23,24,0.5)" }}
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: subs, suffix: "", label: "subscribers tracked", prefix: "" },
            { value: opens, suffix: "%", label: "avg open rate achieved", prefix: "" },
            { value: posts, suffix: "", label: "posts scored", prefix: "" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold tabular-nums" style={{ color: "#fff" }}>
                {s.prefix}{s.value.toLocaleString()}{s.suffix}
              </p>
              <p className="text-xs mt-1" style={{ color: "#555" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#ff6719" }}>V1 Features</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#fff" }}>
            Four tools. Every question answered.
          </h2>
          <p className="mt-4 text-sm max-w-md mx-auto" style={{ color: "#666" }}>
            Built specifically for creators with 100–50,000 subscribers who are serious about growth.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab list */}
          <div className="flex flex-row lg:flex-col gap-2 lg:w-64 shrink-0">
            {features.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className="text-left px-4 py-3 rounded-xl border transition-all duration-200 flex-1 lg:flex-none"
                style={{
                  backgroundColor: activeFeature === i ? "rgba(255,103,25,0.08)" : "rgba(255,255,255,0.02)",
                  borderColor: activeFeature === i ? "rgba(255,103,25,0.3)" : "rgba(255,255,255,0.06)",
                  color: activeFeature === i ? "#fff" : "#555",
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wide block mb-0.5"
                  style={{ color: activeFeature === i ? "#ff6719" : "#333" }}
                >
                  {f.tag} · 0{i + 1}
                </span>
                <span className="text-sm font-medium leading-snug hidden lg:block">{f.title}</span>
                <span className="text-xs font-medium lg:hidden">{f.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div
            className="flex-1 rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "rgba(22,23,24,0.8)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  display: activeFeature === i ? "block" : "none",
                }}
              >
                <div className="p-6 pb-0">
                  <h3 className="text-lg font-bold mb-2" style={{ color: "#fff" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#777" }}>{f.desc}</p>
                </div>
                {f.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Post scoring deep dive ───────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: "rgba(10,10,10,0.8)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#ff6719" }}>Scoring Algorithm</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "#fff" }}>
                Every post gets a grade.<br />No more guessing.
              </h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#666" }}>
                Four signals, weighted to reflect what actually drives Substack growth. Not vanity metrics — subscriber impact.
              </p>
              <div className="flex flex-col gap-4">
                <MetricRow label="Open rate" value="30%" bar={30} color="#ff6719" delay={0} />
                <MetricRow label="Subscriber gain (48h)" value="30%" bar={30} color="#ff8a4c" delay={100} />
                <MetricRow label="Click-through rate" value="20%" bar={20} color="#ffac80" delay={200} />
                <MetricRow label="Restacks & shares" value="20%" bar={20} color="#ffd0b5" delay={300} />
              </div>
            </div>
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: "rgba(22,23,24,0.9)", borderColor: "rgba(255,255,255,0.07)" }}
            >
              <p className="text-xs font-semibold mb-4" style={{ color: "#555" }}>RECENT POSTS · SORTED BY SCORE</p>
              {[
                { title: "My Creator Journey: Year 2", grade: "A", score: 94, opens: "42%", subs: "+48", shares: 23 },
                { title: "10 Tools Every Creator Needs", grade: "A", score: 88, opens: "39%", subs: "+31", shares: 18 },
                { title: "Why I Almost Quit Substack", grade: "A", score: 82, opens: "36%", subs: "+27", shares: 31 },
                { title: "Hot Take: AI is Overrated", grade: "B", score: 71, opens: "31%", subs: "+12", shares: 9 },
                { title: "Weekly Update #47", grade: "C", score: 52, opens: "22%", subs: "+3", shares: 2 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 py-2.5 border-b last:border-0 cursor-default transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded-lg"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <GradeBadge grade={p.grade} delay={i * 60} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#ddd" }}>{p.title}</p>
                    <p className="text-xs" style={{ color: "#444" }}>
                      {p.opens} opens · {p.subs} subs · {p.shares} restacks
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "#ff6719" }}>{p.score}</span>
                </div>
              ))}
              <div className="mt-4 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,103,25,0.07)", color: "#ff6719" }}>
                ✦ Personal stories score 40% higher than how-to posts for your audience
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roadmap preview ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#fff" }}>What's coming next</h2>
          <p className="text-sm" style={{ color: "#555" }}>V2 and V3 ship within 8 weeks of launch</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              version: "V1 · Now",
              color: "#ff6719",
              items: ["Post Performance Scorer", "Subscriber Growth Timeline", "Best Time to Publish", "Free → Paid Conversion Tracker"],
              live: true,
            },
            {
              version: "V2 · Growth",
              color: "#ff8a4c",
              items: ["Notes Performance Tracker", "Churn & Retention Monitor", "Audience Overlap Intelligence", "Weekly AI Growth Report"],
              live: false,
            },
            {
              version: "V3 · Pro",
              color: "#ffac80",
              items: ["Revenue Intelligence Dashboard", "Content Topic Analyzer", "Competitor Benchmarking", "3-month MRR Forecast"],
              live: false,
            },
          ].map((v) => (
            <div
              key={v.version}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: v.live ? "rgba(255,103,25,0.05)" : "rgba(22,23,24,0.5)",
                borderColor: v.live ? "rgba(255,103,25,0.2)" : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold" style={{ color: v.color }}>{v.version}</span>
                {v.live && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#ff6719" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-2">
                {v.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs" style={{ color: v.live ? "#ccc" : "#555" }}>
                    <span style={{ color: v.live ? v.color : "#333", marginTop: 1 }}>
                      {v.live ? "✓" : "○"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6" style={{ backgroundColor: "rgba(8,8,8,0.9)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#ff6719" }}>Pricing</p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#fff" }}>Simple. Honest. Worth it.</h2>
            <p className="text-sm" style={{ color: "#555" }}>14-day free trial, no credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <PricingCard
              plan="Starter"
              price={9}
              annual={79}
              desc="For new and small creators getting started with data."
              features={["Post Performance Scorer", "Growth Timeline", "Best Time to Publish", "Free → Paid Tracker", "Last 90 days data"]}
              accent={false}
              featured={false}
            />
            <PricingCard
              plan="Growth"
              price={29}
              annual={249}
              desc="For active creators who want to grow and retain subscribers."
              features={["Everything in Starter", "Notes Performance Tracker", "Churn & Retention Monitor", "Audience Overlap Intel", "Weekly AI Growth Report"]}
              accent={true}
              featured={true}
            />
            <PricingCard
              plan="Pro"
              price={59}
              annual={499}
              desc="For full-time creators running Substack as a business."
              features={["Everything in Growth", "Revenue Intelligence Dashboard", "Content Topic Analyzer (AI)", "Competitor Benchmarking", "MRR Forecast & LTV"]}
              accent={false}
              featured={false}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(50% 60% at 50% 50%, rgba(255,103,25,0.08) 0%, transparent 100%)",
        }} />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2
            className="font-bold mb-4 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fff" }}
          >
            Stop flying blind.<br />
            <span style={{ color: "#ff6719" }}>Know your growth.</span>
          </h2>
          <p className="text-sm mb-10 max-w-sm mx-auto" style={{ color: "#555" }}>
            Join creators who use SubSutra to grow faster, churn less, and make more — with data that Substack doesn't give you.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#ff6719", color: "#000", fontSize: "0.95rem" }}
          >
            Get started free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="mt-4 text-xs" style={{ color: "#333" }}>No credit card · 14-day trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ff6719" />
              <path d="M6 10l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "#555" }}>SubSutra</span>
          </div>
          <p className="text-xs" style={{ color: "#333" }}>
            © 2026 SubSutra · Built for Substack creators
          </p>
          <div className="flex gap-4 text-xs" style={{ color: "#444" }}>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
