"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, CalendarDays, LineChart, Settings, ChevronLeft, ChevronRight, List } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UI_TEXT } from "@/app/admin/_ui-text"

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutGrid
  disabled?: boolean
}

const NAV: NavItem[] = [
  { href: "/admin", label: UI_TEXT.nav.overview, icon: LayoutGrid },
  { href: "/admin/bookings", label: UI_TEXT.nav.bookings, icon: List },
  { href: "/admin/calendar", label: UI_TEXT.nav.calendar, icon: CalendarDays },
  { href: "/admin/metrics", label: UI_TEXT.nav.metrics, icon: LineChart, disabled: true },
  { href: "/admin/settings", label: UI_TEXT.nav.settings, icon: Settings },
]

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  fullHeight = false,
  className,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  fullHeight?: boolean
  className?: string
}) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "bg-card/60 supports-[backdrop-filter]:bg-background/40 border-r border-border/60 backdrop-blur",
        "flex flex-col gap-3",
        fullHeight ? "h-full" : "h-[calc(100vh-4rem)]",
        collapsed ? "w-[76px]" : "w-[280px]",
        "transition-[width] duration-300 ease-out motion-reduce:transition-none",
        className
      )}
    >
      <div className={cn("px-3 pt-3", collapsed ? "" : "px-4")}> 
        <div className="rounded-xl border bg-background/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className={cn("min-w-0", collapsed && "sr-only")}> 
              <div className="text-sm font-semibold">ClinvetIA</div>
              <div className="text-muted-foreground text-xs">Private Admin</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onToggleCollapsed}
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <nav className={cn("flex-1 px-2", collapsed ? "px-2" : "px-3")}> 
        <div className="space-y-1">
          {NAV.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isDisabled = Boolean(item.disabled)

            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                aria-disabled={isDisabled}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  "cursor-pointer transition-colors",
                  isDisabled && "pointer-events-none opacity-50",
                  isActive
                    ? "bg-gradient-neon/10 text-foreground border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("size-4", isActive && "text-gradient-to dark:text-primary")} />
                <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className={cn("p-3", collapsed ? "p-2" : "p-4")}> 
        <div className={cn("rounded-xl border bg-muted/20 p-3", collapsed && "p-2")}> 
          <div className={cn("text-xs text-muted-foreground", collapsed && "sr-only")}> 
            Tip
          </div>
          <div className={cn("mt-1 text-sm font-medium", collapsed && "sr-only")}> 
            Usa `?state=loading|empty|error`
          </div>
          <div className={cn("mt-2 text-xs text-muted-foreground", collapsed && "sr-only")}> 
            Para ver estados mock.
          </div>
          <div className={cn("mt-2", collapsed ? "flex justify-center" : "")}> 
            <div
              className={cn(
                "h-1.5 w-full rounded-full bg-gradient-to-r from-gradient-from to-gradient-to",
                collapsed && "w-8"
              )}
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
