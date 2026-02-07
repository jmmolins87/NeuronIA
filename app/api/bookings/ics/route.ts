import { z } from "zod"

import { errorJson } from "@/lib/api/respond"
import { bookingConfig } from "@/lib/booking/config"
import { expireHolds } from "@/lib/booking/holds"
import { formatZonedHHmm, formatZonedYYYYMMDD, getNowFromRequest } from "@/lib/booking/time"
import { sha256Hex } from "@/lib/booking/tokens"
import type { BookingLocale } from "@/lib/i18n/booking-strings"
import { getBookingStrings } from "@/lib/i18n/booking-strings"
import { generateIcsText } from "@/lib/ics/generate"
import { toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const TokenSchema = z.string().min(1)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tokenRaw = url.searchParams.get("token")
    const tokenParsed = TokenSchema.safeParse(tokenRaw)
    if (!tokenParsed.success) {
      return errorJson("INVALID_INPUT", "Invalid input", { status: 400, fields: { token: "Required" } })
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

    if (record.expiresAt.getTime() <= now.getTime()) {
      return errorJson("TOKEN_EXPIRED", "Token expired", { status: 410 })
    }

    const booking = record.booking
    if (!booking) {
      return errorJson("NOT_FOUND", "Booking not found", { status: 404 })
    }

    const locale = booking.locale as BookingLocale
    const { t } = getBookingStrings(locale)

    const date = formatZonedYYYYMMDD(booking.startAt, bookingConfig.timeZone)
    const time = formatZonedHHmm(booking.startAt, bookingConfig.timeZone)

    const summary = t("booking.ics.summary")
    const description = t("booking.ics.description", {
      date,
      time,
      timezone: booking.timezone,
    })

    const ics = generateIcsText({
      startAt: booking.startAt,
      endAt: booking.endAt,
      tz: booking.timezone,
      uid: booking.uid ?? booking.id,
      summary,
      description,
    })

    const filename = `clinvetia-booking-${date}-${time.replace(":", "")}.ics`

    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
