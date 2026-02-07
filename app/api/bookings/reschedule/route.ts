import { Prisma } from "@prisma/client"
import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { bookingConfig } from "@/lib/booking/config"
import { expireHolds } from "@/lib/booking/holds"
import {
  assertIsoDateNotPast,
  assertMadridTimeZone,
  assertStartAtNotPast,
  getNowFromRequest,
  parseIsoDate,
  validateRequestedSlot,
  zonedLocalToUtcDate,
} from "@/lib/booking/time"
import { generateBookingUid, sha256Hex } from "@/lib/booking/tokens"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const BodySchema = z.object({
  token: z.string().min(1),
  newDate: z.string(),
  newTime: z.string(),
  timezone: z.string(),
  locale: z.enum(["es", "en"]),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
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

    parseIsoDate(parsed.data.newDate)
    validateRequestedSlot(parsed.data.newTime)
    assertMadridTimeZone(parsed.data.timezone)
    assertIsoDateNotPast(parsed.data.newDate, now, bookingConfig.timeZone)

    const tokenHash = sha256Hex(parsed.data.token)

    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      const record = await tx.bookingToken.findFirst({
        where: {
          kind: "RESCHEDULE",
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

      if (record.usedAt) {
        return { kind: "error" as const, response: errorJson("TOKEN_USED", "Token already used", { status: 410 }) }
      }

      const fromBooking = record.booking
      if (!fromBooking) {
        return { kind: "error" as const, response: errorJson("NOT_FOUND", "Booking not found", { status: 404 }) }
      }

      if (fromBooking.status !== "CONFIRMED" && fromBooking.status !== "HELD") {
        return {
          kind: "error" as const,
          response: errorJson("INVALID_INPUT", "Booking cannot be rescheduled", { status: 409 }),
        }
      }

      const newStartAt = zonedLocalToUtcDate(parsed.data.newDate, parsed.data.newTime, bookingConfig.timeZone)
      assertStartAtNotPast(newStartAt, now)
      const newEndAt = new Date(newStartAt.getTime() + bookingConfig.slotMinutes * 60_000)

      if (bookingConfig.cutoffMinutes > 0) {
        const cutoffMs = bookingConfig.cutoffMinutes * 60_000
        if (newStartAt.getTime() < now.getTime() + cutoffMs) {
          return {
            kind: "error" as const,
            response: errorJson("INVALID_INPUT", "Slot is too soon", {
              status: 400,
              fields: { newTime: `Must be at least ${bookingConfig.cutoffMinutes} minutes in the future` },
            }),
          }
        }
      }

      // Mark original booking as rescheduled (rolled back if the insert fails).
      await tx.booking.update({
        where: { id: fromBooking.id },
        data: {
          status: "RESCHEDULED",
          expiresAt: null,
        },
      })

      const toBooking = await tx.booking.create({
        data: {
          uid: generateBookingUid(),
          status: "CONFIRMED",
          startAt: newStartAt,
          endAt: newEndAt,
          timezone: bookingConfig.timeZone,
          locale: parsed.data.locale,
          expiresAt: null,
          confirmedAt: now,
          contactName: fromBooking.contactName,
          contactEmail: fromBooking.contactEmail,
          contactPhone: fromBooking.contactPhone,
          contactClinicName: fromBooking.contactClinicName,
          contactMessage: fromBooking.contactMessage,
          roiData: fromBooking.roiData ?? undefined,
        },
      })

      await tx.booking.update({
        where: { id: fromBooking.id },
        data: {
          rescheduledToBookingId: toBooking.id,
        },
      })

      await tx.bookingToken.update({
        where: { tokenHash: record.tokenHash },
        data: { usedAt: now },
      })

      await tx.bookingEvent.create({
        data: {
          bookingId: fromBooking.id,
          type: "BOOKING_RESCHEDULED",
          payloadJson: {
            fromId: fromBooking.id,
            toId: toBooking.id,
            oldStartAtISO: fromBooking.startAt.toISOString(),
            newStartAtISO: toBooking.startAt.toISOString(),
          },
        },
      })

      return { kind: "ok" as const, fromBooking, toBooking }
    })

    if (result.kind === "error") return result.response

    return okJson({
      fromBooking: {
        id: result.fromBooking.id,
        status: "RESCHEDULED",
        startAtISO: result.fromBooking.startAt.toISOString(),
        endAtISO: result.fromBooking.endAt.toISOString(),
        timezone: result.fromBooking.timezone,
        locale: result.fromBooking.locale,
      },
      booking: {
        id: result.toBooking.id,
        status: result.toBooking.status,
        startAtISO: result.toBooking.startAt.toISOString(),
        endAtISO: result.toBooking.endAt.toISOString(),
        timezone: result.toBooking.timezone,
        locale: result.toBooking.locale,
        confirmedAtISO: result.toBooking.confirmedAt ? result.toBooking.confirmedAt.toISOString() : null,
      },
    })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return errorJson("SLOT_TAKEN", "Slot already taken", { status: 409 })
    }
    return toResponse(error)
  }
}
