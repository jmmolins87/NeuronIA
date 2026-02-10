import "server-only"

import { NextRequest } from "next/server"
import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdminWithCsrf } from "@/lib/admin/middleware"
import { createBookingAudit } from "@/lib/admin/audit"
import { ADMIN_SECURITY } from "@/lib/admin/constants"
import { canMutateRealData } from "@/lib/admin/api-helpers"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { toResponse } from "@/lib/errors"

export const runtime = "nodejs"

/**
 * Cancel Booking - Admin Only with CSRF Protection
 * 
 * Security:
 * - Requires valid admin session
 * - Requires CSRF token in X-Admin-CSRF header
 * - Only allowed for REAL mode users (DEMO mode blocked)
 * - Environment guardrails prevent local->prod mutations
 * - Creates audit log entry
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // 1. Validate admin session + CSRF
    const auth = await requireAdminWithCsrf(request)
    if (!auth.ok) return auth.error

    const { session } = auth.data
    
    // 2. Validate user can mutate REAL data (not DEMO mode)
    const mutationCheck = canMutateRealData(session.admin.mode)
    if (!mutationCheck.allowed && mutationCheck.response) {
      return mutationCheck.response
    }

    const { id } = await context.params
    if (!id) return errorJson("INVALID_INPUT", "Missing booking id", { status: 400 })

    const now = new Date()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || undefined

    // 3. Cancel booking + create audit log
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } })
      if (!booking) {
        return { kind: "error" as const, response: errorJson("NOT_FOUND", "Booking not found", { status: 404 }) }
      }

      const oldStatus = booking.status

      if (booking.status === "CANCELLED") {
        return { kind: "ok" as const, booking, alreadyCancelled: true }
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
            adminId: session.adminId,
            adminUsername: session.admin.username,
          },
        },
      })

      // 4. Create audit record
      await createBookingAudit(tx, {
        adminId: session.adminId,
        bookingId: booking.id,
        action: ADMIN_SECURITY.AUDIT.BOOKING.CANCEL,
        metadata: {
          oldStatus,
          newStatus: "CANCELLED",
          ip,
          userAgent,
        },
      })

      return { kind: "ok" as const, booking: updated, alreadyCancelled: false }
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
