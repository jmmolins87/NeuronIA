import * as React from "react"
import { CalendarDays, Clock, Mail, Phone, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/ui/neon-card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { TimezoneChip } from "@/components/booking/TimezoneChip"

export interface BookingSummaryBooking {
  id: string
  status: string
  startAtISO: string
  endAtISO: string
  timezone: string
  locale: string
  contact?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

export interface BookingSummaryProps {
  booking: BookingSummaryBooking
  locale: "es" | "en"
  title: string
  className?: string
}

function getIntlLocale(locale: "es" | "en"): string {
  return locale === "en" ? "en-GB" : "es-ES"
}

function formatZoned(iso: string, locale: "es" | "en", timeZone: string) {
  const date = new Date(iso)
  const intlLocale = getIntlLocale(locale)

  const dateText = new Intl.DateTimeFormat(intlLocale, {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date)

  const timeText = new Intl.DateTimeFormat(intlLocale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)

  return { dateText, timeText }
}

function statusChip(status: string, locale: "es" | "en"): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  const map: Record<string, { es: string; en: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    CONFIRMED: { es: "Confirmada", en: "Confirmed", variant: "default" },
    HELD: { es: "Pendiente", en: "Pending", variant: "secondary" },
    CANCELLED: { es: "Cancelada", en: "Cancelled", variant: "destructive" },
    RESCHEDULED: { es: "Reagendada", en: "Rescheduled", variant: "outline" },
  }
  const fallback = { es: status, en: status, variant: "secondary" as const }
  const m = map[status] ?? fallback
  return { label: locale === "en" ? m.en : m.es, variant: m.variant }
}

function formatMaybe(value: string | null | undefined): string {
  const v = value?.trim()
  return v && v.length > 0 ? v : "-"
}

export function BookingSummary({ booking, locale, title, className }: BookingSummaryProps) {
  const start = formatZoned(booking.startAtISO, locale, booking.timezone)
  const end = formatZoned(booking.endAtISO, locale, booking.timezone)
  const status = statusChip(booking.status, locale)

  return (
    <NeonCard className={cn("bg-card/70 backdrop-blur-sm", className)}>
      <NeonCardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <NeonCardTitle className="text-xl">{title}</NeonCardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <TimezoneChip timezone={booking.timezone} />
            </div>
          </div>
        </div>
      </NeonCardHeader>

      <NeonCardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>{locale === "en" ? "Date" : "Fecha"}</span>
            </div>
            <div className="mt-2 text-sm font-semibold capitalize text-foreground">{start.dateText}</div>
          </div>
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-4" />
              <span>{locale === "en" ? "Time" : "Hora"}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">
              {start.timeText} - {end.timeText}
            </div>
          </div>
        </div>

        {booking.contact ? (
          <>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="size-4" />
                  <span>{locale === "en" ? "Contact" : "Contacto"}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-foreground">{formatMaybe(booking.contact.name)}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="size-4" />
                  <span>Email</span>
                </div>
                <div className="mt-2 break-words text-sm font-semibold text-foreground">
                  {formatMaybe(booking.contact.email)}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="size-4" />
                  <span>{locale === "en" ? "Phone" : "Tel."}</span>
                </div>
                <div className="mt-2 break-words text-sm font-semibold text-foreground">
                  {formatMaybe(booking.contact.phone)}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </NeonCardContent>
    </NeonCard>
  )
}
