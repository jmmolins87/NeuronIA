import { CalendarRange } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function DateRangeChip({ label = UI_TEXT.filters.dateRange }: { label?: string }) {
  return (
    <Button variant="outline" className="justify-start gap-2">
      <CalendarRange className="size-4" />
      <span className="text-sm">{label}</span>
      <span className="text-muted-foreground hidden text-xs sm:inline">
        (placeholder)
      </span>
    </Button>
  )
}
