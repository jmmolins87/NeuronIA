import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

import { bookingConfig } from "@/lib/booking/config"
import { assertIsoDateNotPast, formatZonedHHmm, generateSlotsForDate, getLocalDayBoundsUtc, parseIsoDate } from "@/lib/booking/time"
import { expireHolds } from "@/lib/booking/holds"

export interface AvailabilitySlot {
  start: string
  end: string
  available: boolean
}

export interface AvailabilityResult {
  date: string
  timezone: string
  slotMinutes: number
  slots: AvailabilitySlot[]
}

async function getOccupiedStarts(db: Prisma.TransactionClient, date: string, now: Date): Promise<Set<string>> {
  const { start, end } = getLocalDayBoundsUtc(date, bookingConfig.timeZone)

  const bookings = await db.booking.findMany({
    where: {
      startAt: { gte: start, lt: end },
      OR: [
        { status: "CONFIRMED" },
        { status: "HELD", expiresAt: { gt: now } },
      ],
    },
    select: { startAt: true },
  })

  const occupied = new Set<string>()
  for (const b of bookings) {
    occupied.add(formatZonedHHmm(b.startAt, bookingConfig.timeZone))
  }
  return occupied
}

export async function getAvailability(prisma: PrismaClient, date: string, now: Date): Promise<AvailabilityResult> {
  return prisma.$transaction(async (tx) => {
    await expireHolds(tx, now)

    parseIsoDate(date)
    assertIsoDateNotPast(date, now, bookingConfig.timeZone)

    const slots = generateSlotsForDate(date)
    const occupied = await getOccupiedStarts(tx, date, now)

    return {
      date,
      timezone: bookingConfig.timeZone,
      slotMinutes: bookingConfig.slotMinutes,
      slots: slots.map((s) => ({
        start: s.start,
        end: s.end,
        available: !occupied.has(s.start),
      })),
    }
  })
}
