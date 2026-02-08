"use client"

import * as React from "react"
import { CalendarDays, Clock, Info } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface SlotPickerSlot {
  start: string
  end: string
  available: boolean
}

export interface SlotPickerStrings {
  pickDate: string
  newDateLabel: string
  pickTime: string
  timeNotAvailable: string
  sameDayCutoff: string
  loadingSlots: string
  noSlots: string
}

export interface SlotPickerProps {
  locale: "es" | "en"
  strings: SlotPickerStrings
  selectedDate: Date | null
  onDateChange: (date: Date) => void
  selectedTime: string | null
  onTimeChange: (time: string) => void
  slots: SlotPickerSlot[] | null
  loadingSlots: boolean
  className?: string
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getIntlLocale(locale: "es" | "en"): string {
  return locale === "en" ? "en-GB" : "es-ES"
}

function formatSelectedDate(date: Date, locale: "es" | "en"): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date)
}

function isAfterLocalCutoff1930(now: Date): boolean {
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return hours > 19 || (hours === 19 && minutes >= 30)
}

export function SlotPicker({
  locale,
  strings,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  slots,
  loadingSlots,
  className,
}: SlotPickerProps) {
  const today = React.useMemo(() => new Date(), [])
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const isSameDayAsToday = selectedDate ? isSameDay(selectedDate, today) : false
  const localCutoffActive = isSameDayAsToday && isAfterLocalCutoff1930(new Date())

  const dateButtonText = selectedDate ? `${formatSelectedDate(selectedDate, locale)} (${toIsoDate(selectedDate)})` : strings.pickDate

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>{strings.newDateLabel}</span>
          </div>
          <div className="mt-3">
            <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="truncate">{dateButtonText}</span>
                  <CalendarDays className="size-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[min(92vw,420px)] p-4">
                <Calendar
                  locale={getIntlLocale(locale)}
                  selected={selectedDate ?? undefined}
                  onSelect={(d) => {
                    if (!d) return
                    onDateChange(d)
                    setCalendarOpen(false)
                  }}
                  fromDate={new Date()}
                  toDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60_000)}
                  disabled={(d) => {
                    const day = d.getDay()
                    return day === 0 || day === 6
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-4" />
            <span>{strings.pickTime}</span>
          </div>
          <div className="mt-3">
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))}
              </div>
            ) : slots && slots.length > 0 ? (
              <div className="space-y-3">
                {localCutoffActive ? (
                  <div className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-3 text-xs text-muted-foreground">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <p>{strings.sameDayCutoff}</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const disabled = !slot.available || localCutoffActive
                    const isSelected = selectedTime === slot.start
                    const tooltipText = localCutoffActive ? strings.sameDayCutoff : strings.timeNotAvailable

                    const button = (
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return
                          onTimeChange(slot.start)
                        }}
                        className={cn(
                          "h-9 w-full rounded-lg px-2 font-mono text-xs",
                          disabled && "opacity-45",
                          !disabled && "hover:border-primary",
                          isSelected && "dark:glow-primary"
                        )}
                      >
                        {slot.start}
                      </Button>
                    )

                    if (!disabled) return <div key={slot.start}>{button}</div>

                    return (
                      <Tooltip key={slot.start}>
                        <div className="relative">
                          <TooltipTrigger asChild>
                            <span className="inline-flex w-full">{button}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">{tooltipText}</TooltipContent>
                        </div>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ) : selectedDate ? (
              <div className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                {strings.noSlots}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                {strings.loadingSlots}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
