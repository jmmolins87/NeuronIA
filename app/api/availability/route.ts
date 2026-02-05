import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { okJson, errorJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import {
  getNow,
  isSameDayCutoffReached,
  nextDayStartUtc,
  parseDateYYYYMMDD,
  startOfDayUtc,
} from "@/lib/booking/time"
import { generateSlotsForDate } from "@/lib/booking/slots"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date")
  if (!date || !parseDateYYYYMMDD(date)) {
    return errorJson("INVALID_DATE", "Invalid date. Use YYYY-MM-DD.", {
      fields: { date: "Expected format YYYY-MM-DD" },
    })
  }

  const now = getNow(req.headers)

  try {
    await expireHolds(prisma, now)

    const dayStart = startOfDayUtc(date, env.BOOKING_TIMEZONE)
    const dayEnd = nextDayStartUtc(date, env.BOOKING_TIMEZONE)

    const active = await prisma.booking.findMany({
      where: {
        startAt: { gte: dayStart, lt: dayEnd },
        OR: [
          { status: "CONFIRMED" },
          { status: "HELD", expiresAt: { gt: now } },
        ],
      },
      select: { startAt: true, status: true, expiresAt: true },
    })

    const occupied = new Set(active.map((b) => b.startAt.toISOString()))
    const slots = generateSlotsForDate(date).map((s) => {
      const iso = s.startAt.toISOString()
      return {
        time: s.time,
        startAt: iso,
        endAt: s.endAt.toISOString(),
        available: !occupied.has(iso),
      }
    })

    const cutoffReached = isSameDayCutoffReached({
      now,
      bookingDate: date,
      timeZone: env.BOOKING_TIMEZONE,
      cutoffHour: 19,
      cutoffMinute: 30,
    })

    return okJson({
      date,
      timezone: env.BOOKING_TIMEZONE,
      cutoffReached,
      slots,
    })
  } catch (error: unknown) {
    const message =
      env.NODE_ENV === "production"
        ? "Service unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return NextResponse.json(
      { ok: false, code: "AVAILABILITY_UNAVAILABLE", message },
      { status: 500 }
    )
  }
}
