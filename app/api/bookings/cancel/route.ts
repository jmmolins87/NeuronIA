import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import { getNowFromRequest } from "@/lib/booking/time"
import { sha256Hex } from "@/lib/booking/tokens"
import type { BookingLocale } from "@/lib/i18n/booking-strings"
import { getBookingStrings } from "@/lib/i18n/booking-strings"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const BodySchema = z.object({
  token: z.string().min(1),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function POST(request: Request) {
  try {
    const now = getNowFromRequest(request)
    const json = await request.json().catch(() => null)

    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input", {
        status: 400,
        fields: zodToFields(parsed.error),
      })
    }

    const tokenHash = sha256Hex(parsed.data.token)

    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      const record = await tx.bookingToken.findFirst({
        where: {
          kind: "CANCEL",
          tokenHash,
        },
        include: { booking: true },
      })

      if (!record) {
        return { kind: "error" as const, response: errorJson("TOKEN_INVALID", "Invalid token", { status: 400 }) }
      }

      if (record.expiresAt.getTime() <= now.getTime()) {
        return { kind: "error" as const, response: errorJson("TOKEN_EXPIRED", "Token expired", { status: 410 }) }
      }

      const booking = record.booking
      if (!booking) {
        return { kind: "error" as const, response: errorJson("NOT_FOUND", "Booking not found", { status: 404 }) }
      }

      const wasCancelled = booking.status === "CANCELLED"

      if (record.usedAt) {
        if (wasCancelled) {
          return { kind: "ok" as const, booking }
        }
        return {
          kind: "error" as const,
          response: errorJson("TOKEN_INVALID", "Token already used", { status: 400 }),
        }
      }

      const updatedBooking = wasCancelled
        ? booking
        : booking.status === "CONFIRMED" || booking.status === "HELD"
          ? await tx.booking.update({
              where: { id: booking.id },
              data: {
                status: "CANCELLED",
                cancelledAt: now,
              },
            })
          : null

      if (!updatedBooking) {
        return { kind: "error" as const, response: errorJson("BOOKING_NOT_HELD", "Booking cannot be cancelled", { status: 409 }) }
      }

      await tx.bookingToken.update({
        where: { tokenHash: record.tokenHash },
        data: { usedAt: now },
      })

      if (!wasCancelled) {
        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            type: "BOOKING_CANCELLED",
            payloadJson: {
              bookingId: booking.id,
              startAtISO: booking.startAt.toISOString(),
            },
          },
        })
      }

      return { kind: "ok" as const, booking: updatedBooking }
    })

    if (result.kind === "error") return result.response

    const booking = result.booking
    const locale = booking.locale as BookingLocale
    const { t } = getBookingStrings(locale)

    return okJson({
      booking: {
        id: booking.id,
        status: booking.status,
        startAtISO: booking.startAt.toISOString(),
        endAtISO: booking.endAt.toISOString(),
        timezone: booking.timezone,
        locale,
        confirmedAtISO: booking.confirmedAt ? booking.confirmedAt.toISOString() : null,
        cancelledAtISO: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
      },
      message: t("booking.cancel.success"),
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
