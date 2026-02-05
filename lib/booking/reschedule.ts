import "server-only"

import { Prisma } from "@prisma/client"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api/errors"
import { expireHolds } from "@/lib/booking/holds"
import { buildStartEnd, isAlignedToSlot, isWithinWindow } from "@/lib/booking/slots"
import { createBookingEvent } from "@/lib/booking/events"
import { isSameDayCutoffReached, parseDateYYYYMMDD, parseTimeHHMM } from "@/lib/booking/time"
import { sha256Hex } from "@/lib/booking/tokens"

export type BookingLocale = "es" | "en"

export async function validateRescheduleToken(args: { token: string; now: Date }): Promise<{
  bookingId: string
  bookingLocale: BookingLocale
}> {
  const tokenHash = sha256Hex(args.token)

  const bookingToken = await prisma.bookingToken.findFirst({
    where: { kind: "RESCHEDULE", tokenHash },
    include: { booking: true },
  })

  if (!bookingToken) {
    throw new ApiError("TOKEN_INVALID", "Invalid reschedule token.", { status: 400 })
  }
  if (bookingToken.expiresAt <= args.now) {
    throw new ApiError("TOKEN_EXPIRED", "Reschedule token expired.", { status: 410 })
  }
  if (bookingToken.usedAt) {
    throw new ApiError("TOKEN_INVALID", "Reschedule token already used.", { status: 410 })
  }

  const b = bookingToken.booking
  const bookingLocale = (b.locale === "en" ? "en" : "es") satisfies BookingLocale
  return { bookingId: b.id, bookingLocale }
}

export async function rescheduleBookingByToken(args: {
  token: string
  now: Date
  newDate: string
  newTime: string
  durationMinutes?: number
  locale?: BookingLocale
}): Promise<{ bookingId: string; bookingLocale: BookingLocale }> {
  const tokenHash = sha256Hex(args.token)

  if (!parseDateYYYYMMDD(args.newDate) || !parseTimeHHMM(args.newTime)) {
    throw new ApiError("INVALID_INPUT", "Invalid date/time.", {
      status: 400,
      fields: {
        newDate: "Expected YYYY-MM-DD",
        newTime: "Expected HH:mm",
      },
    })
  }

  return prisma.$transaction(async (tx) => {
    await expireHolds(tx, args.now)

    const bookingToken = await tx.bookingToken.findFirst({
      where: {
        kind: "RESCHEDULE",
        tokenHash,
      },
      include: {
        booking: true,
      },
    })

    if (!bookingToken) {
      throw new ApiError("TOKEN_INVALID", "Invalid reschedule token.", { status: 400 })
    }

    if (bookingToken.expiresAt <= args.now) {
      throw new ApiError("TOKEN_EXPIRED", "Reschedule token expired.", { status: 410 })
    }

    if (bookingToken.usedAt) {
      throw new ApiError("TOKEN_INVALID", "Reschedule token already used.", { status: 410 })
    }

    const b = bookingToken.booking
    const bookingLocale = (args.locale ?? (b.locale === "en" ? "en" : "es")) satisfies BookingLocale

    if (b.status !== "CONFIRMED") {
      throw new ApiError("TOKEN_INVALID", "Only confirmed bookings can be rescheduled.", {
        status: 409,
      })
    }

    const existingDurationMinutes = Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60_000)
    const durationMinutes = args.durationMinutes ?? existingDurationMinutes
    if (durationMinutes !== existingDurationMinutes) {
      throw new ApiError("INVALID_INPUT", "Duration mismatch.", {
        status: 400,
        fields: { durationMinutes: "Must match existing booking duration." },
      })
    }

    if (durationMinutes % env.BOOKING_SLOT_MINUTES !== 0) {
      throw new ApiError("INVALID_INPUT", "Invalid duration.", {
        status: 400,
        fields: { durationMinutes: `Multiple of ${env.BOOKING_SLOT_MINUTES}` },
      })
    }

    if (!isAlignedToSlot(args.newTime)) {
      throw new ApiError("INVALID_INPUT", "Time is not aligned to slot boundaries.", {
        status: 400,
        fields: { newTime: `Aligned to ${env.BOOKING_SLOT_MINUTES} minutes` },
      })
    }

    if (!isWithinWindow(args.newTime, durationMinutes)) {
      throw new ApiError("INVALID_INPUT", "Selected time is outside booking window.", {
        status: 400,
        fields: { newTime: "Outside booking window" },
      })
    }

    const cutoffReached = isSameDayCutoffReached({
      now: args.now,
      bookingDate: args.newDate,
      timeZone: env.BOOKING_TIMEZONE,
      cutoffHour: 19,
      cutoffMinute: 30,
    })
    if (cutoffReached) {
      throw new ApiError("SAME_DAY_CUTOFF", "Same-day changes are closed after 19:30.", {
        status: 400,
      })
    }

    const startEnd = buildStartEnd({
      date: args.newDate,
      time: args.newTime,
      durationMinutes,
    })
    if (!startEnd) {
      throw new ApiError("INVALID_INPUT", "Invalid slot.", { status: 400 })
    }

    if (startEnd.startAt.getTime() <= args.now.getTime()) {
      throw new ApiError("INVALID_INPUT", "Cannot reschedule to the past.", {
        status: 400,
        fields: { newDate: "Date/time must be in the future" },
      })
    }

    const oldStartAt = b.startAt
    const oldEndAt = b.endAt

    try {
      await tx.booking.update({
        where: { id: b.id },
        data: {
          startAt: startEnd.startAt,
          endAt: startEnd.endAt,
          rescheduledAt: args.now,
          locale: bookingLocale,
        },
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ApiError("SLOT_TAKEN", "This slot is already taken.", { status: 409 })
        }
      }
      throw error
    }

    await tx.bookingToken.update({
      where: { id: bookingToken.id },
      data: { usedAt: args.now },
    })

    await createBookingEvent(tx, b.id, "RESCHEDULED", {
      oldStartAt: oldStartAt.toISOString(),
      oldEndAt: oldEndAt.toISOString(),
      newStartAt: startEnd.startAt.toISOString(),
      newEndAt: startEnd.endAt.toISOString(),
    })

    return { bookingId: b.id, bookingLocale }
  })
}
