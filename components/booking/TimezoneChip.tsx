import * as React from "react"
import { Globe2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TimezoneChipProps {
  timezone: string
  className?: string
}

export function TimezoneChip({ timezone, className }: TimezoneChipProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 border border-border bg-card/70 text-foreground", className)}
    >
      <Globe2 className="size-3.5 text-muted-foreground" />
      <span className="font-mono text-[11px]">{timezone}</span>
    </Badge>
  )
}
