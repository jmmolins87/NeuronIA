import "server-only"

import { z } from "zod"
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

const Body = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactClinicName: z.string().optional(),
  contactMessage: z.string().optional(),
  roiData: z.any().optional(),
  reason: z.string().optional(),
})

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireAdminApiKey(request)
    if (auth) return auth

    const { id } = await context.params
    if (!id) return errorJson("INVALID_INPUT", "Missing id", { status: 400 })

    const parsed = Body.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid input data", { status: 400 })
    }

    const updateData = parsed.data
    const { reason, ...bookingData } = updateData

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return errorJson("NOT_FOUND", "Booking not found", { status: 404 })
    }

    if (existingBooking.status === "CANCELLED" || existingBooking.status === "EXPIRED") {
      return errorJson("INVALID_STATE", "Cannot update cancelled or expired booking", { status: 400 })
    }

    // Prepare old data for audit
    const oldData = {
      contactName: existingBooking.contactName,
      contactEmail: existingBooking.contactEmail,
      contactPhone: existingBooking.contactPhone,
      contactClinicName: existingBooking.contactClinicName,
      contactMessage: existingBooking.contactMessage,
      roiData: existingBooking.roiData,
    }

    // Filter out undefined values
    const filteredUpdateData = Object.fromEntries(
      Object.entries(bookingData).filter(([_, value]) => value !== undefined)
    )

    if (Object.keys(filteredUpdateData).length === 0) {
      return errorJson("INVALID_INPUT", "No valid fields to update", { status: 400 })
    }

    // Use transaction for atomic update
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Note: Admin audit would require admin session info, which this API key-based endpoint doesn't have
      // For now, we'll just update the booking. In a real implementation, you'd want to track who made the change
      
      // Update booking
      return tx.booking.update({
        where: { id: existingBooking.id },
        data: filteredUpdateData,
      })
    })

    return okJson({
      booking: {
        id: updatedBooking.id,
        uid: updatedBooking.uid,
        contactName: updatedBooking.contactName,
        contactEmail: updatedBooking.contactEmail,
        contactPhone: updatedBooking.contactPhone,
        contactClinicName: updatedBooking.contactClinicName,
        contactMessage: updatedBooking.contactMessage,
        roiData: updatedBooking.roiData,
        updatedAtISO: updatedBooking.updatedAt.toISOString(),
      },
    })

  } catch (error: unknown) {
    return toResponse(error)
  }
}
