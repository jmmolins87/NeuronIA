import { env } from "@/lib/env"
import { parseDateYYYYMMDD, parseTimeHHMM, zonedDateTimeToUtcDate } from "@/lib/booking/time"

export interface Slot {
  startAt: Date
  endAt: Date
  time: string
}

function toMinutes(value: { hour: number; minute: number }): number {
  return value.hour * 60 + value.minute
}

function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function generateSlotsForDate(date: string): Slot[] {
  const start = parseTimeHHMM(env.BOOKING_START_TIME)
  const end = parseTimeHHMM(env.BOOKING_END_TIME)
  const d = parseDateYYYYMMDD(date)
  if (!start || !end || !d) return []

  const step = env.BOOKING_SLOT_MINUTES
  const startMin = toMinutes(start)
  const endMin = toMinutes(end)

  const slots: Slot[] = []
  for (let t = startMin; t + step <= endMin; t += step) {
    const time = minutesToHHMM(t)
    const parts = parseTimeHHMM(time)
    if (!parts) continue
    const startAt = zonedDateTimeToUtcDate({
      timeZone: env.BOOKING_TIMEZONE,
      y: d.y,
      m: d.m,
      d: d.d,
      hour: parts.hour,
      minute: parts.minute,
    })

    const endAt = new Date(startAt.getTime() + step * 60_000)
    slots.push({ startAt, endAt, time })
  }

  return slots
}

export function buildStartEnd(args: {
  date: string
  time: string
  durationMinutes: number
}): { startAt: Date; endAt: Date } | null {
  const d = parseDateYYYYMMDD(args.date)
  const t = parseTimeHHMM(args.time)
  if (!d || !t) return null

  const startAt = zonedDateTimeToUtcDate({
    timeZone: env.BOOKING_TIMEZONE,
    y: d.y,
    m: d.m,
    d: d.d,
    hour: t.hour,
    minute: t.minute,
  })

  const endAt = new Date(startAt.getTime() + args.durationMinutes * 60_000)
  return { startAt, endAt }
}

export function isAlignedToSlot(time: string): boolean {
  const t = parseTimeHHMM(time)
  if (!t) return false
  const minutes = t.hour * 60 + t.minute
  const start = parseTimeHHMM(env.BOOKING_START_TIME)
  if (!start) return false
  const startMin = start.hour * 60 + start.minute
  return (minutes - startMin) % env.BOOKING_SLOT_MINUTES === 0
}

export function isWithinWindow(time: string, durationMinutes: number): boolean {
  const t = parseTimeHHMM(time)
  const start = parseTimeHHMM(env.BOOKING_START_TIME)
  const end = parseTimeHHMM(env.BOOKING_END_TIME)
  if (!t || !start || !end) return false

  const startMin = start.hour * 60 + start.minute
  const endMin = end.hour * 60 + end.minute
  const tMin = t.hour * 60 + t.minute

  return tMin >= startMin && tMin + durationMinutes <= endMin
}
