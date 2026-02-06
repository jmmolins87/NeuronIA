import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { isApiError } from "@/lib/api/errors"
import { getNow } from "@/lib/booking/time"
import { isRoiValid } from "@/lib/booking/roi"
import { confirmBookingAndGenerateTokens, type BookingLocale } from "@/lib/booking/complete"
import { createBookingEvent } from "@/lib/booking/events"
import { generateIcsBase64 } from "@/lib/ics/generate"
import { t } from "@/lib/email/i18n"
import { sendBookingConfirmedEmail } from "@/lib/email/send"

export const runtime = "nodejs"

const BodySchema = z.object({
  sessionToken: z.string().min(10),
  locale: z.enum(["es", "en"]).optional(),
  contact: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email(),
    phone: z.string().min(1).optional(),
  }),
  formData: z.unknown().optional(),
  roiData: z.unknown().optional(),
})

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)"
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function POST(req: NextRequest) {
  const now = getNow(req.headers)

  let body: z.infer<typeof BodySchema>
  try {
    const json = await req.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid request body.", {
        status: 400,
        fields: zodFieldErrors(parsed.error),
      })
    }
    body = parsed.data
  } catch {
    return errorJson("INVALID_INPUT", "Invalid JSON body.", { status: 400 })
  }

  const locale = (body.locale ?? "es") satisfies BookingLocale

  if (!isRoiValid(body.roiData)) {
    return errorJson("ROI_REQUIRED", "ROI data is required to complete booking.", {
      status: 400,
    })
  }

  try {
    const result = await confirmBookingAndGenerateTokens({
      sessionToken: body.sessionToken,
      now,
      locale,
      contact: body.contact,
      formData: body.formData ?? {},
      roiData: body.roiData,
    })

    // Idempotent: if already confirmed, just return OK.
    if (result.idempotent) {
      return okJson({})
    }

    const cancelUrl = `${env.APP_URL}/api/bookings/cancel?token=${encodeURIComponent(result.cancelToken)}`
    const rescheduleUrl = `${env.APP_URL}/api/bookings/reschedule?token=${encodeURIComponent(result.rescheduleToken)}`

    const icsBase64 = generateIcsBase64({
      startAt: result.bookingStartAt,
      endAt: result.bookingEndAt,
      tz: result.bookingTimezone,
      uid: `${result.bookingId}@clinvetia.com`,
      summary: t(locale, "email.ics.summary"),
      description: t(locale, "email.ics.description"),
    })

    if (env.EMAIL_ENABLED) {
      try {
        const emailRes = await sendBookingConfirmedEmail({
          to: result.customerEmail,
          locale,
          booking: {
            startAt: result.bookingStartAt,
            endAt: result.bookingEndAt,
            timezone: result.bookingTimezone,
            id: result.bookingId,
          },
          cancelUrl,
          rescheduleUrl,
          icsBase64,
        })

        await createBookingEvent(prisma, result.bookingId, "EMAIL_SENT", {
          provider: "resend",
          providerId: emailRes.id,
          skipped: emailRes.skipped,
          locale,
        })
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error"
        await createBookingEvent(prisma, result.bookingId, "EMAIL_FAILED", {
          provider: "resend",
          error: msg,
          locale,
        })
        return errorJson("EMAIL_FAILED", "Failed to send confirmation email.", {
          status: 502,
        })
      }
    } else {
      await createBookingEvent(prisma, result.bookingId, "EMAIL_SKIPPED", {
        provider: "resend",
        reason: "EMAIL_ENABLED=false",
        locale,
      })
    }

    if (env.NODE_ENV !== "production") {
      return okJson({
        debug: {
          cancelUrl,
          rescheduleUrl,
          icsBase64,
        },
      })
    }

    return okJson({})
  } catch (error: unknown) {
    if (isApiError(error)) {
      return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
    }

    const message =
      env.NODE_ENV === "production"
        ? "Service unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return NextResponse.json({ ok: false, code: "SERVICE_ERROR", message }, { status: 500 })
  }
}
