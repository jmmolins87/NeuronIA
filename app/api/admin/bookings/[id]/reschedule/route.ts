import "server-only"

import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdminWithCsrf } from "@/lib/admin/middleware"
import { createBookingAudit } from "@/lib/admin/audit"
import { ADMIN_SECURITY } from "@/lib/admin/constants"
import { canMutateRealData } from "@/lib/admin/api-helpers"
import { bookingConfig } from "@/lib/booking/config"
import { expireHolds } from "@/lib/booking/holds"
import {
  assertIsoDateNotPast,
  assertMadridTimeZone,
  assertStartAtNotPast,
  parseIsoDate,
  validateRequestedSlot,
  zonedLocalToUtcDate,
} from "@/lib/booking/time"
import { generateBookingUid } from "@/lib/booking/tokens"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { toResponse } from "@/lib/errors"

export const runtime = "nodejs"

const BodySchema = z.object({
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

/**
 * Reschedule Booking - Admin Only with CSRF Protection
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

    // 3. Parse and validate request body
    const json = await request.json().catch(() => null)
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid input", { status: 400, fields: zodToFields(parsed.error) })
    }

    parseIsoDate(parsed.data.newDate)
    validateRequestedSlot(parsed.data.newTime)
    assertMadridTimeZone(parsed.data.timezone)
    assertIsoDateNotPast(parsed.data.newDate, now, bookingConfig.timeZone)

    const newStartAt = zonedLocalToUtcDate(parsed.data.newDate, parsed.data.newTime, bookingConfig.timeZone)
    assertStartAtNotPast(newStartAt, now)
    const newEndAt = new Date(newStartAt.getTime() + bookingConfig.slotMinutes * 60_000)

    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      const fromBooking = await tx.booking.findUnique({ where: { id } })
      if (!fromBooking) {
        return { kind: "error" as const, response: errorJson("NOT_FOUND", "Booking not found", { status: 404 }) }
      }

      if (fromBooking.status !== "CONFIRMED") {
        return {
          kind: "error" as const,
          response: errorJson("BOOKING_NOT_RESCHEDULABLE", "Booking is not reschedulable", { status: 409 }),
        }
      }

      const occupied = await tx.booking.findFirst({
        where: {
          startAt: newStartAt,
          id: { not: fromBooking.id },
          OR: [{ status: "CONFIRMED" }, { status: "HELD", expiresAt: { gt: now } }],
        },
        select: { id: true },
      })

      if (occupied) {
        return { kind: "error" as const, response: errorJson("SLOT_TAKEN", "Slot already taken", { status: 409 }) }
      }

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

      const updatedFrom = await tx.booking.update({
        where: { id: fromBooking.id },
        data: {
          status: "RESCHEDULED",
          expiresAt: null,
          rescheduledToBookingId: toBooking.id,
        },
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
            source: "ADMIN",
            adminId: session.adminId,
            adminUsername: session.admin.username,
          },
        },
      })

      // Create audit record
      await createBookingAudit(tx, {
        adminId: session.adminId,
        bookingId: fromBooking.id,
        action: ADMIN_SECURITY.AUDIT.BOOKING.RESCHEDULE,
        metadata: {
          fromId: fromBooking.id,
          toId: toBooking.id,
          oldStartAt: fromBooking.startAt.toISOString(),
          newStartAt: toBooking.startAt.toISOString(),
          ip,
          userAgent,
        },
      })

      return { kind: "ok" as const, from: updatedFrom, to: toBooking }
    })

    if (result.kind === "error") return result.response

    const email = env.EMAIL_ENABLED
      ? { enabled: true, skipped: true, provider: "brevo" as const, ok: true, code: "ADMIN_EMAIL_NOT_SENT" }
      : { enabled: false, skipped: true, provider: "brevo" as const, ok: true, code: "EMAIL_DISABLED" }

    return okJson({
      from: {
        id: result.from.id,
        status: result.from.status,
        startAtISO: result.from.startAt.toISOString(),
        endAtISO: result.from.endAt.toISOString(),
        timezone: result.from.timezone,
        locale: result.from.locale,
        rescheduledToBookingId: result.from.rescheduledToBookingId ?? null,
      },
      to: {
        id: result.to.id,
        status: result.to.status,
        startAtISO: result.to.startAt.toISOString(),
        endAtISO: result.to.endAt.toISOString(),
        timezone: result.to.timezone,
        locale: result.to.locale,
        confirmedAtISO: result.to.confirmedAt ? result.to.confirmedAt.toISOString() : null,
      },
      email,
    })
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return errorJson("SLOT_TAKEN", "Slot already taken", { status: 409 })
    }
    return toResponse(error)
  }
}
