"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  ClockIcon,
  ArrowRightLeftIcon,
  Settings2Icon,
  CircleHelpIcon,
  BarChart3Icon,
  ZapIcon,
} from "lucide-react"

const navMain = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Post Performance",
    url: "/dashboard/posts",
    icon: <BarChart3Icon />,
  },
  {
    title: "Growth Timeline",
    url: "/dashboard/growth",
    icon: <TrendingUpIcon />,
  },
  {
    title: "Best Time to Publish",
    url: "/dashboard/timing",
    icon: <ClockIcon />,
  },
  {
    title: "Conversions",
    url: "/dashboard/conversions",
    icon: <ArrowRightLeftIcon />,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: <Settings2Icon />,
  },
  {
    title: "Get Help",
    url: "#",
    icon: <CircleHelpIcon />,
  },
]

const navDocuments = [
  {
    name: "Weekly Report",
    url: "/dashboard/report",
    icon: <BarChart3Icon />,
  },
]

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string }
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <ZapIcon className="size-5!" />
              <span className="text-base font-semibold">SubSutra</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={navDocuments} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
