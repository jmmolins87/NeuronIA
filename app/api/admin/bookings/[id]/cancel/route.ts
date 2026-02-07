import "server-only"

import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdminApiKey } from "@/lib/auth/admin-api"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { toResponse } from "@/lib/errors"

export const runtime = "nodejs"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminApiKey(request)
    if (auth) return auth

    const { id } = await context.params
    if (!id) return errorJson("INVALID_INPUT", "Missing id", { status: 400 })

    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } })
      if (!booking) {
        return { kind: "error" as const, response: errorJson("NOT_FOUND", "Booking not found", { status: 404 }) }
      }

      if (booking.status === "CANCELLED") {
        return { kind: "ok" as const, booking }
      }

      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", cancelledAt: now },
      })

      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          type: "BOOKING_CANCELLED",
          payloadJson: {
            bookingId: booking.id,
            startAtISO: booking.startAt.toISOString(),
            source: "ADMIN",
          },
        },
      })

      return { kind: "ok" as const, booking: updated }
    })

    if (result.kind === "error") return result.response

    const email = env.EMAIL_ENABLED
      ? { enabled: true, skipped: true, provider: "brevo" as const, ok: true, code: "ADMIN_EMAIL_NOT_SENT" }
      : { enabled: false, skipped: true, provider: "brevo" as const, ok: true, code: "EMAIL_DISABLED" }

    return okJson({
      booking: {
        id: result.booking.id,
        status: result.booking.status,
        startAtISO: result.booking.startAt.toISOString(),
        endAtISO: result.booking.endAt.toISOString(),
        timezone: result.booking.timezone,
        locale: result.booking.locale,
        cancelledAtISO: result.booking.cancelledAt ? result.booking.cancelledAt.toISOString() : null,
      },
      email,
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
