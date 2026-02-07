import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import { getNowFromRequest } from "@/lib/booking/time"
import { sha256Hex } from "@/lib/booking/tokens"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const TokenSchema = z.string().min(1)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tokenRaw = url.searchParams.get("token")
    const tokenParsed = TokenSchema.safeParse(tokenRaw)
    if (!tokenParsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input", {
        status: 400,
        fields: { token: "Required" },
      })
    }

    const now = getNowFromRequest(request)
    const tokenHash = sha256Hex(tokenParsed.data)

    const record = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)
      return tx.bookingToken.findUnique({
        where: { tokenHash },
        include: { booking: true },
      })
    })

    if (!record) {
      return errorJson("TOKEN_INVALID", "Invalid token", { status: 400 })
    }

    if (record.kind !== "CANCEL" && record.kind !== "RESCHEDULE" && record.kind !== "SESSION") {
      return errorJson("TOKEN_INVALID", "Invalid token", { status: 400 })
    }

    if (record.expiresAt.getTime() <= now.getTime()) {
      return errorJson("TOKEN_EXPIRED", "Token expired", { status: 410 })
    }

    if (record.usedAt) {
      return errorJson("TOKEN_USED", "Token already used", { status: 410 })
    }

    const booking = record.booking
    if (!booking) {
      return errorJson("NOT_FOUND", "Booking not found", { status: 404 })
    }

    return okJson({
      tokenKind: record.kind,
      booking: {
        id: booking.id,
        status: booking.status,
        startAtISO: booking.startAt.toISOString(),
        endAtISO: booking.endAt.toISOString(),
        timezone: booking.timezone,
        locale: booking.locale,
        contact: {
          name: booking.contactName,
          email: booking.contactEmail,
          phone: booking.contactPhone,
        },
        confirmedAtISO: booking.confirmedAt ? booking.confirmedAt.toISOString() : null,
        cancelledAtISO: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
      },
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
