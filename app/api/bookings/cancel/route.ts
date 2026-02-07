import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import { getNowFromRequest } from "@/lib/booking/time"
import { sha256Hex } from "@/lib/booking/tokens"
import type { BookingLocale } from "@/lib/i18n/booking-strings"
import { getBookingStrings } from "@/lib/i18n/booking-strings"
import { sendCancelledEmail } from "@/lib/email/sendCancelled"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"
import { env } from "@/lib/env"

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
          return { kind: "ok" as const, booking, cancelledNow: false }
        }
        return {
          kind: "error" as const,
          response: errorJson("TOKEN_USED", "Token already used", { status: 410 }),
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
        return {
          kind: "error" as const,
          response: errorJson("INVALID_INPUT", "Booking cannot be cancelled", { status: 409 }),
        }
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

      return { kind: "ok" as const, booking: updatedBooking, cancelledNow: !wasCancelled }
    })

    if (result.kind === "error") return result.response

    const booking = result.booking
    const locale = booking.locale as BookingLocale
    const { t } = getBookingStrings(locale)

    let email:
      | Awaited<ReturnType<typeof sendCancelledEmail>>
      | { enabled: boolean; provider: "brevo"; ok: boolean; skipped?: boolean; code?: string }

    if (!result.cancelledNow) {
      email = { enabled: env.EMAIL_ENABLED, provider: "brevo" as const, ok: true, skipped: true, code: "ALREADY_CANCELLED" }
    } else {
      try {
        email = await sendCancelledEmail({
          booking,
          roiData: booking.roiData,
          icsToken: parsed.data.token,
        })
      } catch {
        email = { enabled: env.EMAIL_ENABLED, provider: "brevo" as const, ok: false, skipped: false, code: "EMAIL_FAILED" }
      }
    }

    if (result.cancelledNow && env.EMAIL_ENABLED && env.EMAIL_NOTIFY_ADMIN && env.ADMIN_EMAIL) {
      void sendCancelledEmail({
        booking,
        roiData: booking.roiData,
        icsToken: parsed.data.token,
        toOverride: env.ADMIN_EMAIL,
        subjectPrefix: "[Admin] ",
      })
    }

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
      email,
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
