import "server-only"

import type { Booking, Prisma } from "@prisma/client"

import { bookingConfig } from "@/lib/booking/config"
import { formatZonedHHmm, formatZonedYYYYMMDD } from "@/lib/booking/time"
import { sendTransacEmail } from "@/lib/email/brevo"
import { buildHtml, buildText } from "@/lib/email/templates/confirmation"
import type { EmailLocale } from "@/lib/i18n/stringsEmail"
import { getEmailStrings } from "@/lib/i18n/stringsEmail"
import { getBookingStrings } from "@/lib/i18n/booking-strings"
import { generateIcsBase64 } from "@/lib/ics/generate"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

function coerceEmailLocale(value: string | null | undefined): EmailLocale {
  return value === "en" ? "en" : "es"
}

function parseFrom(value: string): { name?: string; email: string } {
  const trimmed = value.trim()
  const match = /^(.*)<([^>]+)>$/.exec(trimmed)
  if (match) {
    const name = match[1].trim().replace(/^\"|\"$/g, "")
    const email = match[2].trim()
    return { ...(name ? { name } : {}), email }
  }
  return { email: trimmed }
}

function toErrorPayload(error: unknown): { message: string } {
  const message = error instanceof Error ? error.message : "Unknown error"
  return { message }
}

export type ConfirmationEmailResult =
  | { ok: true; skipped: true; provider: "brevo"; emailSkipped: true }
  | { ok: true; skipped: false; provider: "brevo"; messageId?: string; dryRun?: true }
  | { ok: false; skipped: false; provider: "brevo"; code: "EMAIL_FAILED" }

export async function sendConfirmationEmail(args: {
  booking: Booking
  roiData: Prisma.JsonValue | null
  cancel: { url: string; token: string }
  reschedule: { url: string; token: string }
  sessionToken: string
}): Promise<ConfirmationEmailResult> {
  const provider = "brevo" as const

  if (!env.EMAIL_ENABLED) {
    return { ok: true, skipped: true, provider, emailSkipped: true }
  }

  const locale = coerceEmailLocale(args.booking.locale)
  const { t } = getEmailStrings(locale)

  const toEmail = args.booking.contactEmail
  if (!toEmail) {
    // Should not happen (contact.email is required at confirmation), but do not break confirmation.
    return { ok: false, skipped: false, provider, code: "EMAIL_FAILED" }
  }

  const appUrl = env.APP_URL
  const icsUrl = `${appUrl}/api/bookings/ics/download?token=${encodeURIComponent(args.sessionToken)}`

  const date = formatZonedYYYYMMDD(args.booking.startAt, bookingConfig.timeZone)
  const startTime = formatZonedHHmm(args.booking.startAt, bookingConfig.timeZone)
  const endTime = formatZonedHHmm(args.booking.endAt, bookingConfig.timeZone)
  const durationMinutes = Math.max(
    0,
    Math.round((args.booking.endAt.getTime() - args.booking.startAt.getTime()) / 60_000)
  )

  const { t: tBooking } = getBookingStrings(locale)
  const summary = tBooking("booking.ics.summary")
  const description = tBooking("booking.ics.description", {
    date,
    time: startTime,
    timezone: args.booking.timezone,
  })
  const icsBase64 = generateIcsBase64({
    startAt: args.booking.startAt,
    endAt: args.booking.endAt,
    tz: args.booking.timezone,
    uid: args.booking.uid ?? args.booking.id,
    summary,
    description,
  })

  const emailTemplateArgs = {
    locale,
    appUrl,
    booking: {
      id: args.booking.id,
      uid: args.booking.uid,
      startAtISO: args.booking.startAt.toISOString(),
      endAtISO: args.booking.endAt.toISOString(),
      timezone: args.booking.timezone,
      contactName: args.booking.contactName,
      contactEmail: args.booking.contactEmail,
      contactPhone: args.booking.contactPhone,
      contactClinicName: args.booking.contactClinicName,
      contactMessage: args.booking.contactMessage,
      roiData: args.roiData,
    },
    schedule: {
      date,
      startTime,
      endTime,
      durationMinutes,
      displayTimeZone: bookingConfig.timeZone,
    },
    actions: {
      rescheduleUrl: args.reschedule.url,
      cancelUrl: args.cancel.url,
      icsUrl,
    },
  } as const

  const subject = t("email.confirmation.subject")
  const html = buildHtml(emailTemplateArgs)
  const text = buildText(emailTemplateArgs)

  const from = parseFrom(env.EMAIL_FROM ?? "")

  const replyTo = env.INBOUND_EMAIL_DOMAIN
    ? {
        name: "ClinvetIA",
        email: `booking+${args.booking.id}@${env.INBOUND_EMAIL_DOMAIN}`,
      }
    : undefined

  const dryRun = env.NODE_ENV !== "production" && (env.EMAIL_DRY_RUN ?? false)

  try {
    await prisma.bookingEvent.create({
      data: {
        bookingId: args.booking.id,
        type: "EMAIL_SEND_ATTEMPT",
        payloadJson: { provider, kind: "BOOKING_CONFIRMATION", dryRun },
      },
    })

    if (dryRun) {
      await prisma.bookingEvent.create({
        data: {
          bookingId: args.booking.id,
          type: "EMAIL_SEND_OK",
          payloadJson: { provider, kind: "BOOKING_CONFIRMATION", dryRun },
        },
      })

      return { ok: true, skipped: false, provider, dryRun: true }
    }

    // Anti-spam headers
    const headers: Record<string, string> = {
      "X-Priority": "1",
      "X-Mailer": "ClinvetIA Booking System",
      "Precedence": "bulk",
      "List-Unsubscribe": `<${args.cancel.url}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    }

    const res = await sendTransacEmail({
      from,
      to: [{ email: toEmail, name: args.booking.contactName ?? undefined }],
      replyTo,
      subject,
      html,
      text,
      attachments: [{ name: "invite.ics", content: icsBase64 }],
      tags: ["booking-confirmation"],
      headers,
      timeoutMs: 12_000,
    })

    await prisma.bookingEvent.create({
      data: {
        bookingId: args.booking.id,
        type: "EMAIL_SEND_OK",
        payloadJson: { provider, kind: "BOOKING_CONFIRMATION", messageId: res.messageId ?? null },
      },
    })

    return { ok: true, skipped: false, provider, messageId: res.messageId }
  } catch (error: unknown) {
    console.error("[email] confirmation send failed", {
      bookingId: args.booking.id,
      provider,
      error: toErrorPayload(error),
    })

    try {
      await prisma.bookingEvent.create({
        data: {
          bookingId: args.booking.id,
          type: "EMAIL_SEND_FAIL",
          payloadJson: { provider, kind: "BOOKING_CONFIRMATION", error: toErrorPayload(error) },
        },
      })
    } catch (e: unknown) {
      console.error("[email] failed to write EMAIL_SEND_FAIL event", {
        bookingId: args.booking.id,
        provider,
        error: toErrorPayload(e),
      })
    }

    return { ok: false, skipped: false, provider, code: "EMAIL_FAILED" }
  }
}
