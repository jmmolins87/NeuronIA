import "server-only"

import type { Booking, Prisma } from "@prisma/client"

import { bookingConfig } from "@/lib/booking/config"
import { formatZonedHHmm, formatZonedYYYYMMDD } from "@/lib/booking/time"
import { sendTransacEmail } from "@/lib/email/brevo"
import { buildCancelledEmail } from "@/lib/email/templates/cancelled"
import { coerceEmailTxLocale } from "@/lib/i18n/emailStrings"
import { getBookingStrings } from "@/lib/i18n/booking-strings"
import { generateIcsBase64 } from "@/lib/ics/generate"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export interface ApiEmailResult {
  enabled: boolean
  provider: "brevo"
  ok: boolean
  skipped?: boolean
  code?: string
  messageId?: string
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

async function writeEventSafe(args: { bookingId: string; type: string; payloadJson: Prisma.InputJsonValue }) {
  try {
    await prisma.bookingEvent.create({
      data: {
        bookingId: args.bookingId,
        type: args.type,
        payloadJson: args.payloadJson,
      },
    })
  } catch (e: unknown) {
    console.error("[email] failed to write booking event", {
      bookingId: args.bookingId,
      type: args.type,
      error: toErrorPayload(e),
    })
  }
}

export async function sendCancelledEmail(args: {
  booking: Booking
  roiData: Prisma.JsonValue | null
  // Used for /api/bookings/ics?token=...
  icsToken: string
  // Override recipient (for admin copy)
  toOverride?: string
  subjectPrefix?: string
}): Promise<ApiEmailResult> {
  const provider = "brevo" as const
  const enabled = env.EMAIL_ENABLED

  if (!enabled) {
    return { enabled: false, provider, ok: true, skipped: true }
  }

  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
    await writeEventSafe({
      bookingId: args.booking.id,
      type: "EMAIL_CANCEL_SEND_FAIL",
      payloadJson: { provider, to: args.toOverride ?? args.booking.contactEmail ?? null, error: { code: "EMAIL_NOT_CONFIGURED" } },
    })
    return { enabled: true, provider, ok: false, code: "EMAIL_NOT_CONFIGURED" }
  }

  const locale = coerceEmailTxLocale(args.booking.locale)

  const toEmail = args.toOverride ?? args.booking.contactEmail
  if (!toEmail) {
    await writeEventSafe({
      bookingId: args.booking.id,
      type: "EMAIL_CANCEL_SEND_FAIL",
      payloadJson: { provider, to: null, error: { code: "EMAIL_NO_RECIPIENT" } },
    })
    return { enabled: true, provider, ok: false, code: "EMAIL_NO_RECIPIENT" }
  }

  const appUrl = env.APP_URL
  const icsUrl = `${appUrl}/api/bookings/ics/download?token=${encodeURIComponent(args.icsToken)}`

  const date = formatZonedYYYYMMDD(args.booking.startAt, bookingConfig.timeZone)
  const startTime = formatZonedHHmm(args.booking.startAt, bookingConfig.timeZone)
  const endTime = formatZonedHHmm(args.booking.endAt, bookingConfig.timeZone)

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

  const template = buildCancelledEmail({
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
      roiData: args.roiData,
    },
    schedule: {
      date,
      startTime,
      endTime,
      displayTimeZone: bookingConfig.timeZone,
    },
    actions: {
      bookAgainUrl: `${appUrl}/reservar`,
      icsUrl,
    },
    icsAttachment: {
      name: "ClinvetIA-cita.ics",
      contentBase64: icsBase64,
      contentType: "text/calendar; charset=utf-8",
    },
  })

  const subject = `${args.subjectPrefix ?? ""}${template.subject}`
  const from = parseFrom(env.EMAIL_FROM)

  const replyTo = env.INBOUND_EMAIL_DOMAIN
    ? {
        name: "ClinvetIA",
        email: `booking+${args.booking.id}@${env.INBOUND_EMAIL_DOMAIN}`,
      }
    : undefined

  const dryRun = env.NODE_ENV !== "production" && (env.EMAIL_DRY_RUN ?? false)

  await writeEventSafe({
    bookingId: args.booking.id,
    type: "EMAIL_CANCEL_SEND_ATTEMPT",
    payloadJson: { provider, to: toEmail, bookingId: args.booking.id, dryRun },
  })

  if (dryRun) {
    await writeEventSafe({
      bookingId: args.booking.id,
      type: "EMAIL_CANCEL_SEND_OK",
      payloadJson: { provider, to: toEmail, bookingId: args.booking.id, dryRun },
    })
    return { enabled: true, provider, ok: true, skipped: true, code: "EMAIL_DRY_RUN" }
  }

  try {
    const res = await sendTransacEmail({
      from,
      to: [{ email: toEmail, name: args.booking.contactName ?? undefined }],
      replyTo,
      subject,
      html: template.html,
      text: template.text,
      attachments: template.attachments.map((a) => ({ name: a.name, content: a.contentBase64 })),
      tags: ["booking-cancelled"],
      timeoutMs: 12_000,
    })

    await writeEventSafe({
      bookingId: args.booking.id,
      type: "EMAIL_CANCEL_SEND_OK",
      payloadJson: { provider, to: toEmail, bookingId: args.booking.id, messageId: res.messageId ?? null },
    })

    return { enabled: true, provider, ok: true, messageId: res.messageId }
  } catch (error: unknown) {
    console.error("[email] cancelled send failed", {
      bookingId: args.booking.id,
      provider,
      error: toErrorPayload(error),
    })

    await writeEventSafe({
      bookingId: args.booking.id,
      type: "EMAIL_CANCEL_SEND_FAIL",
      payloadJson: { provider, to: toEmail, bookingId: args.booking.id, error: toErrorPayload(error) },
    })

    return { enabled: true, provider, ok: false, code: "EMAIL_FAILED" }
  }
}
