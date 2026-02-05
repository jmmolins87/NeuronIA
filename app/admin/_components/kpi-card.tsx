import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: "neutral" | "good" | "warn" | "bad"
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        tone === "good" && "border-emerald-500/20",
        tone === "warn" && "border-amber-500/20",
        tone === "bad" && "border-destructive/25"
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className={cn(
              "rounded-md border bg-muted/30 p-2",
              tone === "good" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
              tone === "warn" && "border-amber-500/20 bg-amber-500/10 text-amber-500",
              tone === "bad" && "border-destructive/30 bg-destructive/10 text-destructive"
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
        {hint ? (
          <div className="text-muted-foreground mt-1 text-sm">{hint}</div>
        ) : null}
      </CardContent>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gradient-from/0 via-gradient-to/40 to-gradient-to/0"
      />
    </Card>
  )
}
