import "server-only"

import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdminApiKey } from "@/lib/auth/admin-api"
import { prisma } from "@/lib/prisma"
import { toResponse } from "@/lib/errors"

export const runtime = "nodejs"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminApiKey(request)
    if (auth) return auth

    const { id } = await context.params
    if (!id) return errorJson("INVALID_INPUT", "Missing id", { status: 400 })

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) return errorJson("NOT_FOUND", "Booking not found", { status: 404 })

    const [events, tokens] = await prisma.$transaction([
      prisma.bookingEvent.findMany({ where: { bookingId: booking.id }, orderBy: { createdAt: "desc" } }),
      prisma.bookingToken.findMany({ where: { bookingId: booking.id }, orderBy: { createdAt: "desc" } }),
    ])

    return okJson({
      booking: {
        id: booking.id,
        uid: booking.uid,
        status: booking.status,
        startAtISO: booking.startAt.toISOString(),
        endAtISO: booking.endAt.toISOString(),
        timezone: booking.timezone,
        locale: booking.locale,
        expiresAtISO: booking.expiresAt ? booking.expiresAt.toISOString() : null,
        confirmedAtISO: booking.confirmedAt ? booking.confirmedAt.toISOString() : null,
        cancelledAtISO: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
        createdAtISO: booking.createdAt.toISOString(),
        updatedAtISO: booking.updatedAt.toISOString(),
        contact: {
          name: booking.contactName ?? null,
          email: booking.contactEmail ?? null,
          phone: booking.contactPhone ?? null,
          clinicName: booking.contactClinicName ?? null,
          message: booking.contactMessage ?? null,
        },
        roiData: booking.roiData ?? null,
        rescheduledToBookingId: booking.rescheduledToBookingId ?? null,
        tokens: tokens.map((t) => ({
          id: t.id,
          kind: t.kind,
          tokenHash: t.tokenHash,
          expiresAtISO: t.expiresAt.toISOString(),
          usedAtISO: t.usedAt ? t.usedAt.toISOString() : null,
          createdAtISO: t.createdAt.toISOString(),
        })),
        events: events.map((e) => ({
          id: e.id,
          type: e.type,
          payload: e.payloadJson,
          createdAtISO: e.createdAt.toISOString(),
        })),
      },
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
