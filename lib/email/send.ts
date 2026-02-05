import "server-only"

import type { Booking } from "@prisma/client"
import * as React from "react"
import { Resend } from "resend"

import { env } from "@/lib/env"
import { BookingConfirmedEmail } from "@/lib/email/templates/BookingConfirmedEmail"
import { t, type EmailLocale } from "@/lib/email/i18n"

function toIntlLocale(locale: EmailLocale): string {
  return locale === "es" ? "es-ES" : "en-US"
}

export function formatBookingDateTime(args: {
  locale: EmailLocale
  timeZone: string
  startAt: Date
}): { dateText: string; timeText: string; timeZoneText: string } {
  const intlLocale = toIntlLocale(args.locale)

  const dateText = new Intl.DateTimeFormat(intlLocale, {
    timeZone: args.timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(args.startAt)

  const timeText = new Intl.DateTimeFormat(intlLocale, {
    timeZone: args.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(args.startAt)

  return {
    dateText,
    timeText,
    timeZoneText: args.timeZone,
  }
}

export async function sendBookingConfirmedEmail(args: {
  to: string
  locale: EmailLocale
  booking: Pick<Booking, "startAt" | "endAt" | "timezone"> & { id?: string }
  cancelUrl: string
  rescheduleUrl: string
  icsBase64: string
}): Promise<{ id: string; skipped: boolean }> {
  if (!env.EMAIL_ENABLED) {
    return { id: "disabled", skipped: true }
  }

  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing")
  }

  const resend = new Resend(env.RESEND_API_KEY)
  const subject = t(args.locale, "email.bookingConfirmed.subject")

  const { dateText, timeText, timeZoneText } = formatBookingDateTime({
    locale: args.locale,
    timeZone: args.booking.timezone,
    startAt: args.booking.startAt,
  })

  const email = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: args.to,
    subject,
    bcc: env.ADMIN_EMAIL ? [env.ADMIN_EMAIL] : undefined,
    react: React.createElement(BookingConfirmedEmail, {
      locale: args.locale,
      logoUrl: `${env.APP_URL}/logo.png`,
      title: t(args.locale, "email.bookingConfirmed.title"),
      intro: t(args.locale, "email.bookingConfirmed.intro"),
      detailsTitle: t(args.locale, "email.bookingConfirmed.detailsTitle"),
      actionsTitle: t(args.locale, "email.bookingConfirmed.actionsTitle"),
      dateLabel: t(args.locale, "email.bookingConfirmed.dateLabel"),
      timeLabel: t(args.locale, "email.bookingConfirmed.timeLabel"),
      timezoneLabel: t(args.locale, "email.bookingConfirmed.timezoneLabel"),
      dateText,
      timeText,
      timezoneText: timeZoneText,
      cancelUrl: args.cancelUrl,
      rescheduleUrl: args.rescheduleUrl,
    }),
    attachments: [
      {
        filename: "cita-clinvet.ics",
        content: Buffer.from(args.icsBase64, "base64"),
        contentType: "text/calendar; charset=utf-8",
      },
    ],
  })

  return { id: email.data?.id ?? "unknown", skipped: false }
}
