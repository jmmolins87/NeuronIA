import { Prisma } from "@prisma/client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { okJson, errorJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import { buildStartEnd, isAlignedToSlot, isWithinWindow } from "@/lib/booking/slots"
import { getNow, isSameDayCutoffReached, parseDateYYYYMMDD, parseTimeHHMM } from "@/lib/booking/time"

export const runtime = "nodejs"

const BodySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:MM
  durationMinutes: z.number().int().positive().optional(),
  locale: z.enum(["es", "en"]).optional(),
  timezone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).optional(),
})

function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export async function POST(req: NextRequest) {
  const now = getNow(req.headers)

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return errorJson("INVALID_BODY", "Invalid JSON body.")
  }

  const fields: Record<string, string> = {}

  if (!parseDateYYYYMMDD(body.date)) fields.date = "Expected YYYY-MM-DD"
  if (!parseTimeHHMM(body.time)) fields.time = "Expected HH:MM"
  if (Object.keys(fields).length > 0) {
    return errorJson("VALIDATION_ERROR", "Invalid fields.", { fields })
  }

  if (body.timezone && body.timezone !== env.BOOKING_TIMEZONE) {
    return errorJson("INVALID_TIMEZONE", `Only ${env.BOOKING_TIMEZONE} is supported.`, {
      fields: { timezone: "Unsupported timezone" },
    })
  }

  const durationMinutes = body.durationMinutes ?? env.BOOKING_SLOT_MINUTES
  if (durationMinutes % env.BOOKING_SLOT_MINUTES !== 0) {
    return errorJson("INVALID_DURATION", "Duration must be a multiple of slot size.", {
      fields: { durationMinutes: `Multiple of ${env.BOOKING_SLOT_MINUTES}` },
    })
  }

  if (!isAlignedToSlot(body.time)) {
    return errorJson("INVALID_SLOT", "Time is not aligned to slot boundaries.", {
      fields: { time: `Aligned to ${env.BOOKING_SLOT_MINUTES} minutes` },
    })
  }

  if (!isWithinWindow(body.time, durationMinutes)) {
    return errorJson("OUTSIDE_BUSINESS_HOURS", "Selected time is outside booking window.", {
      status: 400,
      fields: { time: "Outside booking window" },
    })
  }

  const cutoffReached = isSameDayCutoffReached({
    now,
    bookingDate: body.date,
    timeZone: env.BOOKING_TIMEZONE,
    cutoffHour: 19,
    cutoffMinute: 30,
  })
  if (cutoffReached) {
    return errorJson(
      "SAME_DAY_CUTOFF",
      "Same-day bookings are closed after 19:30.",
      { status: 409 }
    )
  }

  const startEnd = buildStartEnd({
    date: body.date,
    time: body.time,
    durationMinutes,
  })
  if (!startEnd) {
    return errorJson("INVALID_SLOT", "Invalid date/time.")
  }

  if (startEnd.startAt.getTime() <= now.getTime()) {
    return errorJson("DATE_IN_PAST", "Cannot book in the past.", {
      status: 409,
    })
  }

  const expiresAt = new Date(now.getTime() + env.HOLD_TTL_MINUTES * 60_000)
  const sessionToken = generateToken()
  const tokenHash = sha256Hex(sessionToken)

  try {
    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      const booking = await tx.booking.create({
        data: {
          status: "HELD",
          startAt: startEnd.startAt,
          endAt: startEnd.endAt,
          timezone: env.BOOKING_TIMEZONE,
          locale: body.locale ?? "es",
          customerEmail: body.customerEmail,
          customerName: body.customerName,
          expiresAt,
          events: {
            create: {
              type: "HOLD_CREATED",
              metadata: {
                date: body.date,
                time: body.time,
                durationMinutes,
              },
            },
          },
        },
        select: {
          id: true,
          status: true,
          startAt: true,
          endAt: true,
          timezone: true,
          locale: true,
          expiresAt: true,
          createdAt: true,
        },
      })

      await tx.bookingToken.create({
        data: {
          bookingId: booking.id,
          kind: "SESSION",
          tokenHash,
          expiresAt,
        },
      })

      return booking
    })

    return okJson({
      booking: {
        ...result,
        startAt: result.startAt.toISOString(),
        endAt: result.endAt.toISOString(),
        expiresAt: result.expiresAt?.toISOString() ?? null,
        createdAt: result.createdAt.toISOString(),
      },
      sessionToken,
      sessionExpiresAt: expiresAt.toISOString(),
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique violation (partial unique index on startAt)
      if (error.code === "P2002") {
        return errorJson("SLOT_TAKEN", "This slot is already taken.", { status: 409 })
      }
    }

    const message =
      env.NODE_ENV === "production"
        ? "Service unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return NextResponse.json(
      { ok: false, code: "BOOKING_CREATE_FAILED", message },
      { status: 500 }
    )
  }
}
