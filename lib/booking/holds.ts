import "server-only"

import type { Booking, BookingToken, Prisma } from "@prisma/client"

import { bookingConfig } from "@/lib/booking/config"
import { ApiError } from "@/lib/errors"
import { zonedLocalToUtcDate } from "@/lib/booking/time"
import { generateSessionToken, sha256Hex } from "@/lib/booking/tokens"

export async function expireHolds(db: Prisma.TransactionClient, now: Date): Promise<number> {
  const result = await db.booking.updateMany({
    where: {
      status: "HELD",
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  })

  return result.count
}

export interface CreateHoldInput {
  date: string // YYYY-MM-DD
  time: string // HH:mm
  timezone: "Europe/Madrid"
  locale: "es" | "en"
}

export interface CreateHoldResult {
  booking: Booking
  token: BookingToken
  sessionToken: string
}

export async function createHold(db: Prisma.TransactionClient, input: CreateHoldInput, now: Date): Promise<CreateHoldResult> {
  if (input.timezone !== bookingConfig.timeZone) {
    throw new ApiError("INVALID_INPUT", "Invalid timezone", {
      status: 400,
      fields: { timezone: `Only ${bookingConfig.timeZone} is supported` },
    })
  }

  const startAt = zonedLocalToUtcDate(input.date, input.time, input.timezone)
  const endAt = new Date(startAt.getTime() + bookingConfig.slotMinutes * 60_000)
  const expiresAt = new Date(now.getTime() + bookingConfig.holdTtlMinutes * 60_000)

  if (bookingConfig.cutoffMinutes > 0) {
    const cutoffMs = bookingConfig.cutoffMinutes * 60_000
    if (startAt.getTime() < now.getTime() + cutoffMs) {
      throw new ApiError("INVALID_INPUT", "Slot is too soon", {
        status: 400,
        fields: { time: `Must be at least ${bookingConfig.cutoffMinutes} minutes in the future` },
      })
    }
  }

  const sessionToken = generateSessionToken()
  const tokenHash = sha256Hex(sessionToken)

  const booking = await db.booking.create({
    data: {
      status: "HELD",
      startAt,
      endAt,
      timezone: input.timezone,
      locale: input.locale,
      expiresAt,
    },
  })

  const token = await db.bookingToken.create({
    data: {
      bookingId: booking.id,
      kind: "SESSION",
      tokenHash,
      expiresAt,
    },
  })

  return { booking, token, sessionToken }
}
