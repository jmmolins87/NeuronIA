import "server-only"

import { env } from "@/lib/env"
import { ApiError } from "@/lib/errors"
import { bookingConfig } from "@/lib/booking/config"

export interface IsoDateParts {
  year: number
  month: number
  day: number
}

export interface TimeParts {
  hour: number
  minute: number
  totalMinutes: number
}

export function parseIsoDate(value: string): IsoDateParts {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value)
  if (!match) {
    throw new ApiError("INVALID_INPUT", "Invalid date", {
      status: 400,
      fields: { date: "Expected YYYY-MM-DD" },
    })
  }

  const [y, m, d] = value.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  // Validate that the date exists (e.g. reject 2026-02-31).
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new ApiError("INVALID_INPUT", "Invalid date", {
      status: 400,
      fields: { date: "Invalid calendar date" },
    })
  }

  return { year: y, month: m, day: d }
}

export function addDaysToIsoDate(value: string, days: number): string {
  const { year, month, day } = parseIsoDate(value)
  const dt = new Date(Date.UTC(year, month - 1, day + days))
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0")
  const d = String(dt.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseTimeHHmm(value: string): TimeParts {
  const match = /^\d{2}:\d{2}$/.exec(value)
  if (!match) {
    throw new ApiError("INVALID_INPUT", "Invalid time", {
      status: 400,
      fields: { time: "Expected HH:mm" },
    })
  }

  const [hh, mm] = value.split(":").map(Number)
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    throw new ApiError("INVALID_INPUT", "Invalid time", {
      status: 400,
      fields: { time: "Invalid time" },
    })
  }

  return { hour: hh, minute: mm, totalMinutes: hh * 60 + mm }
}

export function minutesToHHmm(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  // Returns offset minutes such that: utc = local - offset.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value
  }

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  )

  return (asUtc - date.getTime()) / 60000
}

export function zonedLocalToUtcDate(date: string, time: string, timeZone: string): Date {
  const { year, month, day } = parseIsoDate(date)
  const { hour, minute } = parseTimeHHmm(time)

  // First guess: interpret local time as if it were UTC.
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
  const offset1 = getTimeZoneOffsetMinutes(utcGuess, timeZone)
  let utcMs = utcGuess.getTime() - offset1 * 60000

  // Re-check offset at the corrected instant to handle DST boundaries.
  const corrected = new Date(utcMs)
  const offset2 = getTimeZoneOffsetMinutes(corrected, timeZone)
  if (offset2 !== offset1) {
    utcMs = utcGuess.getTime() - offset2 * 60000
  }

  return new Date(utcMs)
}

export function formatZonedHHmm(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  return dtf.format(date)
}

export function formatZonedYYYYMMDD(date: Date, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  // en-CA yields YYYY-MM-DD in most runtimes, but formatToParts is safer.
  const parts = dtf.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value
  }

  return `${map.year}-${map.month}-${map.day}`
}

export function getNowFromRequest(request: Request): Date {
  if (env.NODE_ENV !== "production" && bookingConfig.allowTimeOverride) {
    const debugNow = request.headers.get("x-debug-now")
    if (debugNow) {
      const parsed = new Date(debugNow)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
  }

  return new Date()
}

export function assertMadridTimeZone(value: string): asserts value is "Europe/Madrid" {
  if (value !== bookingConfig.timeZone) {
    throw new ApiError("INVALID_INPUT", "Invalid timezone", {
      status: 400,
      fields: { timezone: `Only ${bookingConfig.timeZone} is supported` },
    })
  }
}

export interface SlotDef {
  start: string // HH:mm
  end: string // HH:mm
}

export function generateSlotsForDate(date: string): SlotDef[] {
  parseIsoDate(date)
  const start = parseTimeHHmm(bookingConfig.startTime)
  const end = parseTimeHHmm(bookingConfig.endTime)
  if (bookingConfig.slotMinutes <= 0) {
    throw new ApiError("INTERNAL_ERROR", "Invalid slot configuration", { status: 500 })
  }
  if (start.totalMinutes >= end.totalMinutes) {
    throw new ApiError("INTERNAL_ERROR", "Invalid booking window", { status: 500 })
  }

  const slots: SlotDef[] = []
  for (
    let t = start.totalMinutes;
    t + bookingConfig.slotMinutes <= end.totalMinutes;
    t += bookingConfig.slotMinutes
  ) {
    slots.push({
      start: minutesToHHmm(t),
      end: minutesToHHmm(t + bookingConfig.slotMinutes),
    })
  }
  return slots
}

export function validateRequestedSlot(time: string): void {
  const t = parseTimeHHmm(time)
  const windowStart = parseTimeHHmm(bookingConfig.startTime)
  const windowEnd = parseTimeHHmm(bookingConfig.endTime)

  if (t.totalMinutes < windowStart.totalMinutes || t.totalMinutes >= windowEnd.totalMinutes) {
    throw new ApiError("INVALID_INPUT", "Time outside booking window", {
      status: 400,
      fields: { time: `Must be between ${bookingConfig.startTime} and ${bookingConfig.endTime}` },
    })
  }
  if (t.totalMinutes % bookingConfig.slotMinutes !== 0) {
    throw new ApiError("INVALID_INPUT", "Time not aligned to slot", {
      status: 400,
      fields: { time: `Must be a multiple of ${bookingConfig.slotMinutes} minutes` },
    })
  }
}

export function getLocalDayBoundsUtc(date: string, timeZone: string): { start: Date; end: Date } {
  const start = zonedLocalToUtcDate(date, "00:00", timeZone)
  const nextDay = addDaysToIsoDate(date, 1)
  const end = zonedLocalToUtcDate(nextDay, "00:00", timeZone)
  return { start, end }
}
