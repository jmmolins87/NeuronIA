"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  month?: Date
  onMonthChange?: (month: Date) => void
  locale?: string
  disabled?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
  className?: string
}

export function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  locale = "es-ES",
  disabled,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => month ?? new Date())

  React.useEffect(() => {
    if (month) setInternalMonth(month)
  }, [month])

  const currentMonth = month ?? internalMonth
  const year = currentMonth.getFullYear()
  const mon = currentMonth.getMonth()

  const firstDay = new Date(year, mon, 1)
  const lastDay = new Date(year, mon + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay() // 0..6 (Sun..Sat)

  const setMonth = (next: Date) => {
    if (onMonthChange) onMonthChange(next)
    if (!month) setInternalMonth(next)
  }

  const weekdayLabels = React.useMemo(() => {
    const base = new Date(2024, 0, 7) // Sunday
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" })
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(base.getTime() + i * 24 * 60 * 60_000)))
  }, [locale])

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth)

  const cells: Array<React.ReactNode> = []
  const total = Math.ceil((daysInMonth + startingDay) / 7) * 7

  const min = fromDate ? startOfDay(fromDate) : null
  const max = toDate ? startOfDay(toDate) : null

  for (let i = 0; i < total; i++) {
    if (i < startingDay || i >= startingDay + daysInMonth) {
      cells.push(<div key={`empty-${i}`} className="aspect-square" />)
      continue
    }

    const day = i - startingDay + 1
    const date = new Date(year, mon, day)
    const dayStart = startOfDay(date)

    const isDisabled =
      Boolean(disabled?.(date)) ||
      (min ? dayStart.getTime() < min.getTime() : false) ||
      (max ? dayStart.getTime() > max.getTime() : false)
    const isSelected = selected ? isSameDay(date, selected) : false

    const label = `${year}-${pad2(mon + 1)}-${pad2(day)}`

    cells.push(
      <button
        key={label}
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect?.(date)}
        className={cn(
          "aspect-square rounded-lg border text-sm font-medium transition-colors",
          isDisabled ? "cursor-not-allowed opacity-40" : "hover:bg-primary/10 hover:border-primary",
          isSelected
            ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
            : "bg-card text-foreground border-border"
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2 pb-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(new Date(year, mon - 1, 1))}
          aria-label="Previous month"
          className="h-9 w-9"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1 text-center text-sm font-semibold capitalize">{title}</div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(new Date(year, mon + 1, 1))}
          aria-label="Next month"
          className="h-9 w-9"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 pb-2">
        {weekdayLabels.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{cells}</div>
    </div>
  )
}
