import type { Prisma } from "@prisma/client"
import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { bookingConfig } from "@/lib/booking/config"
import { expireHolds } from "@/lib/booking/holds"
import { getNowFromRequest } from "@/lib/booking/time"
import { generateBookingUid, generateToken, sha256Hex } from "@/lib/booking/tokens"
import type { BookingLocale } from "@/lib/i18n/booking-strings"
import { ApiError, toResponse } from "@/lib/errors"
import { sendConfirmationEmail } from "@/lib/email/sendConfirmation"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const ContactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z
    .string()
    .min(7)
    .max(30)
    .refine((v) => /^[+()\-\s\d]+$/.test(v), "Invalid phone"),
  clinicName: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
})

const BodySchema = z.object({
  sessionToken: z.string().min(1),
  locale: z.enum(["es", "en"]),
  contact: ContactSchema,
  roi: z.unknown(),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

function isNonEmptyJsonObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  if (Array.isArray(value)) return false
  return Object.keys(value as Record<string, unknown>).length > 0
}

function normalizeJson(value: unknown): Prisma.InputJsonValue {
  // Ensures the payload is JSON-serializable (no Dates/functions/cycles).
  // Throws on cyclic structures.
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60_000)
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

    if (!isNonEmptyJsonObject(parsed.data.roi)) {
      return errorJson("ROI_REQUIRED", "ROI data is required", { status: 400 })
    }

    let roiData: Prisma.InputJsonValue
    try {
      roiData = normalizeJson(parsed.data.roi)
      if (typeof roiData !== "object" || roiData === null || Array.isArray(roiData)) {
        return errorJson("ROI_REQUIRED", "ROI data is required", { status: 400 })
      }
      if (Object.keys(roiData as Record<string, unknown>).length === 0) {
        return errorJson("ROI_REQUIRED", "ROI data is required", { status: 400 })
      }
    } catch {
      throw new ApiError("INVALID_INPUT", "Invalid input", {
        status: 400,
        fields: { roi: "Expected a JSON object" },
      })
    }

    const tokenHash = sha256Hex(parsed.data.sessionToken)
    const sessionExtendedTo = addDays(now, bookingConfig.rescheduleTokenExpiryDays)

    const result = await prisma.$transaction(async (tx) => {
      await expireHolds(tx, now)

      const sessionTokenRecord = await tx.bookingToken.findFirst({
        where: { kind: "SESSION", tokenHash },
        include: { booking: true },
      })

      if (!sessionTokenRecord) {
        throw new ApiError("TOKEN_INVALID", "Invalid token", { status: 400 })
      }

      if (sessionTokenRecord.expiresAt.getTime() <= now.getTime()) {
        throw new ApiError("TOKEN_EXPIRED", "Token expired", { status: 410 })
      }

      const booking = sessionTokenRecord.booking
      if (!booking) {
        throw new ApiError("NOT_FOUND", "Booking not found", { status: 404 })
      }

      if (booking.status !== "HELD" && booking.status !== "CONFIRMED") {
        throw new ApiError("BOOKING_NOT_HELD", "Booking not held", { status: 409 })
      }

      const wasAlreadyConfirmed = booking.status === "CONFIRMED"

      const updatedBooking = wasAlreadyConfirmed
        ? booking
        : await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: "CONFIRMED",
              confirmedAt: now,
              expiresAt: null,
              uid: booking.uid || generateBookingUid(),
              locale: parsed.data.locale,
              contactName: parsed.data.contact.fullName,
              contactEmail: parsed.data.contact.email,
              contactPhone: parsed.data.contact.phone,
              contactClinicName: parsed.data.contact.clinicName ?? null,
              contactMessage: parsed.data.contact.message ?? null,
              roiData,
            },
          })

      await tx.bookingToken.update({
        where: { tokenHash: sessionTokenRecord.tokenHash },
        data: { expiresAt: sessionExtendedTo },
      })

      const cancelToken = generateToken()
      const rescheduleToken = generateToken()

      await tx.bookingToken.createMany({
        data: [
          {
            bookingId: booking.id,
            kind: "CANCEL",
            tokenHash: sha256Hex(cancelToken),
            expiresAt: addDays(now, bookingConfig.cancelTokenExpiryDays),
          },
          {
            bookingId: booking.id,
            kind: "RESCHEDULE",
            tokenHash: sha256Hex(rescheduleToken),
            expiresAt: addDays(now, bookingConfig.rescheduleTokenExpiryDays),
          },
        ],
      })

      if (!wasAlreadyConfirmed) {
        await tx.bookingEvent.create({
          data: {
            bookingId: booking.id,
            type: "BOOKING_CONFIRMED",
            payloadJson: {
              bookingId: booking.id,
              startAtISO: booking.startAt.toISOString(),
              locale: parsed.data.locale,
              contactEmail: parsed.data.contact.email,
            },
          },
        })
      }

      return {
        booking: updatedBooking,
        cancelToken,
        rescheduleToken,
        wasAlreadyConfirmed,
      }
    })

    const booking = result.booking
    const locale = booking.locale as BookingLocale

    const cancel = {
      token: result.cancelToken,
      url: `${env.APP_URL}/cancel?token=${encodeURIComponent(result.cancelToken)}`,
    }

    const reschedule = {
      token: result.rescheduleToken,
      url: `${env.APP_URL}/reschedule?token=${encodeURIComponent(result.rescheduleToken)}`,
    }

    let email:
      | { ok: true; skipped: true; provider: "brevo"; emailSkipped?: true; reason?: string }
      | { ok: true; skipped: false; provider: "brevo"; messageId?: string; dryRun?: true }
      | { ok: false; skipped: false; provider: "brevo"; code: "EMAIL_FAILED" }

    if (result.wasAlreadyConfirmed) {
      email = { ok: true, skipped: true, provider: "brevo", reason: "ALREADY_CONFIRMED" }
    } else {
      try {
        const sent = await sendConfirmationEmail({
          booking,
          roiData: booking.roiData,
          cancel,
          reschedule,
          sessionToken: parsed.data.sessionToken,
        })
        if (sent.ok && sent.skipped) {
          email = { ok: true, skipped: true, provider: "brevo", emailSkipped: true }
        } else {
          email = sent
        }
      } catch (e: unknown) {
        console.error("[email] unexpected error (sendConfirmationEmail)", e)
        email = { ok: false, skipped: false, provider: "brevo", code: "EMAIL_FAILED" }
      }
    }

    return okJson({
      booking: {
        id: booking.id,
        status: booking.status,
        startAtISO: booking.startAt.toISOString(),
        endAtISO: booking.endAt.toISOString(),
        timezone: booking.timezone,
        locale,
        confirmedAtISO: booking.confirmedAt ? booking.confirmedAt.toISOString() : null,
        contact: {
          fullName: booking.contactName,
          email: booking.contactEmail,
          phone: booking.contactPhone,
          clinicName: booking.contactClinicName,
          message: booking.contactMessage,
        },
      },
      cancel,
      reschedule,
      ics: {
        url: `${env.APP_URL}/api/bookings/ics?token=${encodeURIComponent(parsed.data.sessionToken)}`,
      },
      email,
      ...(email.ok && email.skipped && email.emailSkipped ? { emailSkipped: true } : {}),
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
