import { Prisma } from "@prisma/client"
import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { bookingConfig } from "@/lib/booking/config"
import { expireHolds, createHold } from "@/lib/booking/holds"
import { getNowFromRequest, assertMadridTimeZone, parseIsoDate, validateRequestedSlot } from "@/lib/booking/time"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const BodySchema = z.object({
  date: z.string(),
  time: z.string(),
  timezone: z.string(),
  locale: z.enum(["es", "en"]).optional(),
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

    const locale = parsed.data.locale ?? "es"
    parseIsoDate(parsed.data.date)
    validateRequestedSlot(parsed.data.time)
    assertMadridTimeZone(parsed.data.timezone)

    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      return createHold(
        tx,
        {
          date: parsed.data.date,
          time: parsed.data.time,
          timezone: bookingConfig.timeZone,
          locale,
        },
        now
      )
    })

    return okJson({
      sessionToken: result.sessionToken,
      booking: {
        date: parsed.data.date,
        time: parsed.data.time,
        startAtISO: result.booking.startAt.toISOString(),
        endAtISO: result.booking.endAt.toISOString(),
        expiresAtISO: result.booking.expiresAt
          ? result.booking.expiresAt.toISOString()
          : null,
        timezone: result.booking.timezone,
        locale: result.booking.locale,
      },
    })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return errorJson("SLOT_TAKEN", "Slot already taken", { status: 409 })
    }
    return toResponse(error)
  }
}
