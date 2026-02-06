import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { ApiError, isApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/admin/auth"
import { toAdminBookingDetailDTO } from "@/lib/admin/serializers"
import { expireHolds } from "@/lib/booking/holds"
import { buildStartEnd, isAlignedToSlot, isWithinWindow } from "@/lib/booking/slots"
import { createBookingEvent } from "@/lib/booking/events"
import { getNow, isSameDayCutoffReached, parseDateYYYYMMDD, parseTimeHHMM } from "@/lib/booking/time"

export const runtime = "nodejs"

const BodySchema = z.object({
  newDate: z.string(),
  newTime: z.string(),
  durationMinutes: z.number().int().positive().optional(),
  timezone: z.string().optional(),
})

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)"
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await ctx.params
    const now = getNow(req.headers)

    let body: z.infer<typeof BodySchema>
    try {
      const json = await req.json()
      const parsed = BodySchema.safeParse(json)
      if (!parsed.success) {
        return errorJson("INVALID_INPUT", "Invalid request body.", {
          status: 400,
          fields: zodFieldErrors(parsed.error),
        })
      }
      body = parsed.data
    } catch {
      return errorJson("INVALID_INPUT", "Invalid JSON body.", { status: 400 })
    }

    if (!parseDateYYYYMMDD(body.newDate) || !parseTimeHHMM(body.newTime)) {
      return errorJson("INVALID_INPUT", "Invalid date/time.", {
        status: 400,
        fields: {
          newDate: "Expected YYYY-MM-DD",
          newTime: "Expected HH:mm",
        },
      })
    }

    if (body.timezone && body.timezone !== env.BOOKING_TIMEZONE) {
      return errorJson("INVALID_INPUT", "Invalid timezone.", {
        status: 400,
        fields: { timezone: `Only ${env.BOOKING_TIMEZONE} is supported.` },
      })
    }

    await expireHolds(prisma, now)

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new ApiError("NOT_FOUND", "Booking not found.", { status: 404 })
    if (booking.status === "CANCELLED") {
      throw new ApiError("INVALID_INPUT", "Cancelled bookings cannot be rescheduled.", { status: 409 })
    }
    if (booking.status === "EXPIRED") {
      throw new ApiError("INVALID_INPUT", "Expired holds cannot be rescheduled.", { status: 409 })
    }

    const existingDurationMinutes = Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60_000)
    const durationMinutes = body.durationMinutes ?? existingDurationMinutes

    if (durationMinutes !== existingDurationMinutes) {
      return errorJson("INVALID_INPUT", "Duration mismatch.", {
        status: 400,
        fields: { durationMinutes: "Must match existing booking duration." },
      })
    }

    if (durationMinutes % env.BOOKING_SLOT_MINUTES !== 0) {
      return errorJson("INVALID_INPUT", "Invalid duration.", {
        status: 400,
        fields: { durationMinutes: `Multiple of ${env.BOOKING_SLOT_MINUTES}` },
      })
    }

    if (!isAlignedToSlot(body.newTime)) {
      return errorJson("INVALID_INPUT", "Time is not aligned to slot boundaries.", {
        status: 400,
        fields: { newTime: `Aligned to ${env.BOOKING_SLOT_MINUTES} minutes` },
      })
    }

    if (!isWithinWindow(body.newTime, durationMinutes)) {
      return errorJson("INVALID_INPUT", "Selected time is outside booking window.", {
        status: 400,
        fields: { newTime: "Outside booking window" },
      })
    }

    const cutoffReached = isSameDayCutoffReached({
      now,
      bookingDate: body.newDate,
      timeZone: env.BOOKING_TIMEZONE,
      cutoffHour: 19,
      cutoffMinute: 30,
    })
    if (cutoffReached) {
      throw new ApiError("SAME_DAY_CUTOFF", "Same-day changes are closed after 19:30.", { status: 400 })
    }

    const startEnd = buildStartEnd({
      date: body.newDate,
      time: body.newTime,
      durationMinutes,
    })
    if (!startEnd) {
      return errorJson("INVALID_INPUT", "Invalid slot.", { status: 400 })
    }

    if (startEnd.startAt.getTime() <= now.getTime()) {
      return errorJson("INVALID_INPUT", "Cannot reschedule to the past.", {
        status: 400,
        fields: { newDate: "Date/time must be in the future" },
      })
    }

    const oldStartAt = booking.startAt
    const oldEndAt = booking.endAt

    const occupied = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        startAt: startEnd.startAt,
        OR: [
          { status: "CONFIRMED" },
          { status: "HELD", expiresAt: { gt: now } },
        ],
      },
      select: { id: true },
    })
    if (occupied) {
      throw new ApiError("SLOT_TAKEN", "This slot is already taken.", { status: 409 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      let updatedBooking
      try {
        updatedBooking = await tx.booking.update({
          where: { id },
          data: {
            startAt: startEnd.startAt,
            endAt: startEnd.endAt,
            rescheduledAt: now,
          },
        })
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw new ApiError("SLOT_TAKEN", "This slot is already taken.", { status: 409 })
        }
        throw error
      }

      await createBookingEvent(tx, id, "ADMIN_RESCHEDULED", {
        admin: true,
        oldStartAt: oldStartAt.toISOString(),
        oldEndAt: oldEndAt.toISOString(),
        newStartAt: startEnd.startAt.toISOString(),
        newEndAt: startEnd.endAt.toISOString(),
      })

      return updatedBooking
    })

    return okJson({
      data: {
        booking: toAdminBookingDetailDTO(updated),
      },
    })
  } catch (error: unknown) {
    if (isApiError(error)) {
      return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, code: "SERVICE_ERROR", message }, { status: 500 })
  }
}
