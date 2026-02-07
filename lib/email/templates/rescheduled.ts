import "server-only"

import type { Prisma } from "@prisma/client"

import type { EmailTxLocale } from "@/lib/i18n/emailStrings"
import { getEmailTxStrings } from "@/lib/i18n/emailStrings"

import { buildCalendarLinks, escapeHtml, formatMaybe, getRoiKeyValues, safeJsonStringify } from "@/lib/email/templates/_shared"

export interface EmailAttachment {
  name: string
  contentBase64: string
  contentType: string
}

export interface RescheduledEmailTemplateArgs {
  locale: EmailTxLocale
  appUrl: string
  booking: {
    id: string
    uid: string
    startAtISO: string
    endAtISO: string
    timezone: string
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    contactClinicName: string | null
    roiData: Prisma.JsonValue | null
  }
  fromBooking?: {
    date: string
    startTime: string
    endTime: string
  }
  schedule: {
    date: string
    startTime: string
    endTime: string
    displayTimeZone: string
  }
  actions: {
    cancelUrl: string
    rescheduleUrl: string
    icsUrl: string
  }
  icsAttachment?: EmailAttachment
}

export function buildRescheduledEmail(args: RescheduledEmailTemplateArgs): {
  subject: string
  html: string
  text: string
  attachments: EmailAttachment[]
} {
  const { t } = getEmailTxStrings(args.locale)

  const subject = t("email.subject.rescheduled")
  const logoUrl = `${args.appUrl.replace(/\/$/, "")}/logo.png`

  const calendar = buildCalendarLinks({
    title: "ClinvetIA",
    details: `${t("email.text.rescheduledIntro")}\n${t("email.labels.date")}: ${args.schedule.date}\n${t("email.labels.time")}: ${args.schedule.startTime} - ${args.schedule.endTime}\n${t("email.labels.timezone")}: ${args.schedule.displayTimeZone}`,
    startUtc: new Date(args.booking.startAtISO),
    endUtc: new Date(args.booking.endAtISO),
  })

  const roiKv = getRoiKeyValues(args.booking.roiData)
  const roiRaw = safeJsonStringify(args.booking.roiData, 2500)

  const accent = "#2EE9A6"
  const bg = "#0B0F1A"
  const card = "#101827"
  const text = "#E6EEF9"
  const muted = "#A9B4C7"
  const border = "#1D2A44"

  function row(label: string, value: string): string {
    return `
      <tr>
        <td style="padding:10px 12px; border-top:1px solid ${border}; color:${muted}; width:38%; font-size:13px; vertical-align:top;">${escapeHtml(
          label
        )}</td>
        <td style="padding:10px 12px; border-top:1px solid ${border}; color:${text}; font-size:13px; vertical-align:top;">${escapeHtml(
          value
        )}</td>
      </tr>
    `
  }

  const roiTableRows = roiKv.map((kv) => row(kv.key, kv.value)).join("")

  const attachments = args.icsAttachment ? [args.icsAttachment] : []

  const html = `<!doctype html>
<html lang="${escapeHtml(args.locale)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background:${bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px; max-width:100%;">
            <tr>
              <td style="padding:8px 8px 18px 8px;">
                <img src="${escapeHtml(logoUrl)}" width="140" alt="ClinvetIA" style="display:block; border:0; outline:none; text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="background:${card}; border:1px solid ${border}; border-radius:16px; overflow:hidden;">
                <div style="height:2px; background:linear-gradient(90deg, rgba(46,233,166,0), rgba(46,233,166,1), rgba(46,233,166,0));"></div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:22px 20px 10px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:20px; line-height:1.25; color:${text}; font-weight:800;">
                        ${escapeHtml(subject)}
                      </div>
                      <div style="margin-top:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; line-height:1.6; color:${muted};">
                        ${escapeHtml(t("email.text.rescheduledIntro"))}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px 16px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                        ${escapeHtml(args.locale === "en" ? "New appointment" : "Nueva cita")}
                      </div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                        ${row(t("email.labels.date"), args.schedule.date)}
                        ${row(t("email.labels.time"), `${args.schedule.startTime} - ${args.schedule.endTime}`)}
                        ${row(t("email.labels.timezone"), args.schedule.displayTimeZone)}
                      </table>
                    </td>
                  </tr>

                  ${
                    args.fromBooking
                      ? `<tr>
                          <td style="padding:0 20px 16px 20px;">
                            <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                              ${escapeHtml(args.locale === "en" ? "Previous appointment (reference)" : "Cita anterior (referencia)")}
                            </div>
                            <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; line-height:1.6; color:${muted};">
                              ${escapeHtml(`${args.fromBooking.date} ${args.fromBooking.startTime} - ${args.fromBooking.endTime} (${args.schedule.displayTimeZone})`)}
                            </div>
                          </td>
                        </tr>`
                      : ""
                  }

                  <tr>
                    <td style="padding:0 20px 16px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                        ${escapeHtml(args.locale === "en" ? "Contact" : "Contacto")}
                      </div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                        ${row(t("email.labels.name"), formatMaybe(args.booking.contactName))}
                        ${row(t("email.labels.email"), formatMaybe(args.booking.contactEmail))}
                        ${row(t("email.labels.phone"), formatMaybe(args.booking.contactPhone))}
                        ${row(t("email.labels.clinic"), formatMaybe(args.booking.contactClinicName))}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px 16px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                        ${escapeHtml(t("email.labels.roi"))}
                      </div>
                      ${
                        roiTableRows
                          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">${roiTableRows}</table>`
                          : `<div style="margin-top:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:${muted};">-</div>`
                      }
                      ${
                        roiRaw
                          ? `<div style="margin-top:12px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                              <div style="padding:10px 12px; color:${muted}; font-size:12px; background:#0E1626;">${escapeHtml(
                                args.locale === "en" ? "ROI (raw excerpt)" : "ROI (extracto)"
                              )}</div>
                              <pre style="margin:0; padding:12px; white-space:pre-wrap; word-break:break-word; font-size:12px; line-height:1.4; color:${text};">${escapeHtml(
                                roiRaw
                              )}</pre>
                            </div>`
                          : ""
                      }
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 20px 20px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="left" style="padding:0 0 10px 0;">
                            <a href="${escapeHtml(
                              args.actions.icsUrl
                            )}" style="display:inline-block; background:${accent}; color:#041014; text-decoration:none; padding:12px 16px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; font-weight:800;">
                              ${escapeHtml(t("email.cta.downloadIcs"))}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0;">
                            <a href="${escapeHtml(
                              args.actions.rescheduleUrl
                            )}" style="display:inline-block; border:1px solid ${border}; color:${text}; text-decoration:none; padding:10px 14px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; font-weight:700; margin-right:10px;">
                              ${escapeHtml(t("email.cta.reschedule"))}
                            </a>
                            <a href="${escapeHtml(
                              args.actions.cancelUrl
                            )}" style="display:inline-block; border:1px solid ${border}; color:${text}; text-decoration:none; padding:10px 14px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; font-weight:700;">
                              ${escapeHtml(t("email.cta.cancel"))}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top:14px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; line-height:1.6; color:${muted};">
                        ${escapeHtml(args.locale === "en" ? "Add to calendar:" : "Anadir al calendario:")}
                        <a href="${escapeHtml(calendar.googleUrl)}" style="color:${accent}; text-decoration:underline;">Google</a>
                        &nbsp;|&nbsp;
                        <a href="${escapeHtml(calendar.outlookUrl)}" style="color:${accent}; text-decoration:underline;">Outlook</a>
                        <br />
                        ${escapeHtml(args.locale === "en" ? "ICS link:" : "Link .ics:")}
                        <a href="${escapeHtml(args.actions.icsUrl)}" style="color:${accent}; text-decoration:underline;">${escapeHtml(
                          args.actions.icsUrl
                        )}</a>
                      </div>

                      <div style="margin-top:16px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; line-height:1.6; color:${muted};">
                        ${escapeHtml(t("email.text.footer"))}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const textLines: string[] = []
  textLines.push(subject)
  textLines.push("")
  textLines.push(t("email.text.rescheduledIntro"))
  textLines.push("")
  textLines.push(`${args.locale === "en" ? "New appointment" : "Nueva cita"}`)
  textLines.push(`${t("email.labels.date")}: ${args.schedule.date}`)
  textLines.push(`${t("email.labels.time")}: ${args.schedule.startTime} - ${args.schedule.endTime}`)
  textLines.push(`${t("email.labels.timezone")}: ${args.schedule.displayTimeZone}`)
  textLines.push("")
  if (args.fromBooking) {
    textLines.push(args.locale === "en" ? "Previous appointment (reference):" : "Cita anterior (referencia):")
    textLines.push(`${args.fromBooking.date} ${args.fromBooking.startTime} - ${args.fromBooking.endTime} (${args.schedule.displayTimeZone})`)
    textLines.push("")
  }
  textLines.push(`${t("email.labels.name")}: ${formatMaybe(args.booking.contactName)}`)
  textLines.push(`${t("email.labels.email")}: ${formatMaybe(args.booking.contactEmail)}`)
  textLines.push(`${t("email.labels.phone")}: ${formatMaybe(args.booking.contactPhone)}`)
  textLines.push(`${t("email.labels.clinic")}: ${formatMaybe(args.booking.contactClinicName)}`)
  textLines.push("")
  textLines.push(`${t("email.labels.roi")}:`)
  if (roiKv.length === 0) {
    textLines.push("-")
  } else {
    for (const kv of roiKv) {
      textLines.push(`- ${kv.key}: ${kv.value}`)
    }
  }
  if (roiRaw) {
    textLines.push("")
    textLines.push(args.locale === "en" ? "ROI (raw excerpt):" : "ROI (extracto):")
    textLines.push(roiRaw)
  }
  textLines.push("")
  textLines.push(`${t("email.cta.downloadIcs")}: ${args.actions.icsUrl}`)
  textLines.push(`${t("email.cta.reschedule")}: ${args.actions.rescheduleUrl}`)
  textLines.push(`${t("email.cta.cancel")}: ${args.actions.cancelUrl}`)
  textLines.push("")
  textLines.push(args.locale === "en" ? "Add to calendar:" : "Anadir al calendario:")
  textLines.push(`Google: ${calendar.googleUrl}`)
  textLines.push(`Outlook: ${calendar.outlookUrl}`)
  textLines.push(`ICS: ${args.actions.icsUrl}`)
  textLines.push("")
  textLines.push(t("email.text.footer"))

  return {
    subject,
    html,
    text: textLines.join("\n"),
    attachments,
  }
}
