import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger
          className="-ml-1 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        />
        <Separator
          orientation="vertical"
          className="mx-1 h-4 data-vertical:self-auto"
          style={{ backgroundColor: "var(--border-subtle)" }}
        />
        <h1
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(255,103,25,0.12)",
              color: "var(--accent-orange)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            V1 · Starter
          </span>
        </div>
      </div>
    </header>
  )
}
