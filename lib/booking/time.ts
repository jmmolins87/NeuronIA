import type { Headers } from "next/dist/compiled/@edge-runtime/primitives"

import { env } from "@/lib/env"

export interface TimeParts {
  hour: number
  minute: number
}

export function parseDateYYYYMMDD(value: string): { y: number; m: number; d: number } | null {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null
  if (mo < 1 || mo > 12) return null
  if (d < 1 || d > 31) return null
  return { y, m: mo, d }
}

export function parseTimeHHMM(value: string): TimeParts | null {
  const m = /^([0-9]{2}):([0-9]{2})$/.exec(value)
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (hour < 0 || hour > 23) return null
  if (minute < 0 || minute > 59) return null
  return { hour, minute }
}

function parseGmtOffset(value: string): number | null {
  // Examples: "GMT+1", "GMT+02:00", "UTC-3"
  const m = /^(?:GMT|UTC)([+-])([0-9]{1,2})(?::?([0-9]{2}))?$/.exec(value)
  if (!m) return null
  const sign = m[1] === "-" ? -1 : 1
  const hours = Number(m[2])
  const minutes = m[3] ? Number(m[3]) : 0
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return sign * (hours * 60 + minutes)
}

export function getTimeZoneOffsetMinutes(timeZone: string, utcDate: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcDate)

  const tzName = parts.find((p) => p.type === "timeZoneName")?.value
  const offset = tzName ? parseGmtOffset(tzName) : null
  if (offset === null) {
    // Fallback: assume UTC
    return 0
  }
  return offset
}

export function zonedDateTimeToUtcDate(args: {
  timeZone: string
  y: number
  m: number
  d: number
  hour: number
  minute: number
}): Date {
  const { timeZone, y, m, d, hour, minute } = args

  // First guess: treat local time as UTC.
  const guessUtcMs = Date.UTC(y, m - 1, d, hour, minute, 0, 0)
  const guessDate = new Date(guessUtcMs)
  const offset1 = getTimeZoneOffsetMinutes(timeZone, guessDate)
  let utcMs = guessUtcMs - offset1 * 60_000

  // Second pass for DST boundary correctness.
  const offset2 = getTimeZoneOffsetMinutes(timeZone, new Date(utcMs))
  if (offset2 !== offset1) {
    utcMs = guessUtcMs - offset2 * 60_000
  }

  return new Date(utcMs)
}

export function utcToZonedDateKey(utcDate: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(utcDate)

  const y = parts.find((p) => p.type === "year")?.value
  const m = parts.find((p) => p.type === "month")?.value
  const d = parts.find((p) => p.type === "day")?.value
  if (!y || !m || !d) return ""
  return `${y}-${m}-${d}`
}

export function utcToZonedTimeParts(utcDate: Date, timeZone: string): TimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(utcDate)

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  return { hour, minute }
}

export function getNow(headers: Headers): Date {
  if (env.NODE_ENV !== "production" && env.ALLOW_TIME_OVERRIDE) {
    const override = headers.get("x-debug-now")
    if (override) {
      const d = new Date(override)
      if (!Number.isNaN(d.getTime())) return d
    }
  }
  return new Date()
}

export function isSameDayCutoffReached(args: {
  now: Date
  bookingDate: string
  timeZone: string
  cutoffHour: number
  cutoffMinute: number
}): boolean {
  const { now, bookingDate, timeZone, cutoffHour, cutoffMinute } = args
  const todayKey = utcToZonedDateKey(now, timeZone)
  if (todayKey !== bookingDate) return false

  const { hour, minute } = utcToZonedTimeParts(now, timeZone)
  if (hour > cutoffHour) return true
  if (hour < cutoffHour) return false
  return minute >= cutoffMinute
}

export function startOfDayUtc(bookingDate: string, timeZone: string): Date {
  const p = parseDateYYYYMMDD(bookingDate)
  if (!p) throw new Error("Invalid date")
  return zonedDateTimeToUtcDate({ timeZone, y: p.y, m: p.m, d: p.d, hour: 0, minute: 0 })
}

export function nextDayStartUtc(bookingDate: string, timeZone: string): Date {
  const p = parseDateYYYYMMDD(bookingDate)
  if (!p) throw new Error("Invalid date")
  const base = new Date(Date.UTC(p.y, p.m - 1, p.d, 12, 0, 0, 0))
  // Add one day in zoned terms by moving the calendar date.
  const next = new Date(base)
  next.setUTCDate(next.getUTCDate() + 1)
  const nextKey = utcToZonedDateKey(next, timeZone)
  const np = parseDateYYYYMMDD(nextKey)
  if (!np) throw new Error("Invalid next date")
  return zonedDateTimeToUtcDate({ timeZone, y: np.y, m: np.m, d: np.d, hour: 0, minute: 0 })
}
