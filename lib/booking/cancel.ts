import "server-only"

import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api/errors"
import { createBookingEvent } from "@/lib/booking/events"
import { sha256Hex } from "@/lib/booking/tokens"

export type BookingLocale = "es" | "en"

export async function cancelBookingByToken(args: { token: string; now: Date }): Promise<{
  bookingId: string
  bookingLocale: BookingLocale
  alreadyCancelled: boolean
  alreadyUsed: boolean
}> {
  const tokenHash = sha256Hex(args.token)

  return prisma.$transaction(async (tx) => {
    const bookingToken = await tx.bookingToken.findFirst({
      where: {
        kind: "CANCEL",
        tokenHash,
      },
      include: {
        booking: true,
      },
    })

    if (!bookingToken) {
      throw new ApiError("TOKEN_INVALID", "Invalid cancel token.", { status: 400 })
    }

    if (bookingToken.expiresAt <= args.now) {
      throw new ApiError("TOKEN_EXPIRED", "Cancel token expired.", { status: 410 })
    }

    const b = bookingToken.booking
    const bookingLocale = (b.locale === "en" ? "en" : "es") satisfies BookingLocale

    if (bookingToken.usedAt) {
      if (b.status === "CANCELLED") {
        return {
          bookingId: b.id,
          bookingLocale,
          alreadyCancelled: true,
          alreadyUsed: true,
        }
      }
      throw new ApiError("TOKEN_INVALID", "Cancel token already used.", { status: 410 })
    }

    if (b.status === "CANCELLED") {
      await tx.bookingToken.update({
        where: { id: bookingToken.id },
        data: { usedAt: args.now },
      })
      return {
        bookingId: b.id,
        bookingLocale,
        alreadyCancelled: true,
        alreadyUsed: false,
      }
    }

    await tx.booking.update({
      where: { id: b.id },
      data: {
        status: "CANCELLED",
        cancelledAt: args.now,
      },
    })

    await tx.bookingToken.update({
      where: { id: bookingToken.id },
      data: { usedAt: args.now },
    })

    await createBookingEvent(tx, b.id, "CANCELLED")

    return {
      bookingId: b.id,
      bookingLocale,
      alreadyCancelled: false,
      alreadyUsed: false,
    }
  })
}
