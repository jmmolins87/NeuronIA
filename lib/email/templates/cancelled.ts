import "server-only"

import type { Prisma } from "@prisma/client"

import type { EmailTxLocale } from "@/lib/i18n/emailStrings"
import { getEmailTxStrings } from "@/lib/i18n/emailStrings"

import { buildCalendarLinks, escapeHtml, formatMaybe, getRoiKeyValues } from "@/lib/email/templates/_shared"

export interface EmailAttachment {
  name: string
  contentBase64: string
  contentType: string
}

export interface CancelledEmailTemplateArgs {
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
  schedule: {
    date: string
    startTime: string
    endTime: string
    displayTimeZone: string
  }
  actions: {
    bookAgainUrl: string
    icsUrl: string
  }
  icsAttachment?: EmailAttachment
}

export function buildCancelledEmail(args: CancelledEmailTemplateArgs): {
  subject: string
  html: string
  text: string
  attachments: EmailAttachment[]
} {
  const { t } = getEmailTxStrings(args.locale)

  const subject = t("email.subject.cancelled")
  const logoUrl = `${args.appUrl.replace(/\/$/, "")}/logo.png`

  const calendar = buildCalendarLinks({
    title: "ClinvetIA",
    details: `${t("email.text.cancelledIntro")}\n${t("email.labels.date")}: ${args.schedule.date}\n${t("email.labels.time")}: ${args.schedule.startTime} - ${args.schedule.endTime}\n${t("email.labels.timezone")}: ${args.schedule.displayTimeZone}`,
    startUtc: new Date(args.booking.startAtISO),
    endUtc: new Date(args.booking.endAtISO),
  })

  const roiKv = getRoiKeyValues(args.booking.roiData)

  const accent = "#2EE9A6"
  const bg = "#0B0F1A"
  const card = "#101827"
  const text = "#E6EEF9"
  const muted = "#A9B4C7"
  const border = "#1D2A44"
  
  // Button colors matching app components
  const buttonBookAgain = "#0ea5e9"  // DemoButton blue (sky-500)

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
                        ${escapeHtml(t("email.text.cancelledIntro"))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 16px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                        ${row(t("email.labels.date"), args.schedule.date)}
                        ${row(t("email.labels.time"), `${args.schedule.startTime} - ${args.schedule.endTime}`)}
                        ${row(t("email.labels.timezone"), args.schedule.displayTimeZone)}
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
                      <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; line-height:1.6; color:${muted};">
                        ${roiTableRows ? "" : escapeHtml("-")}
                      </div>
                      ${
                        roiTableRows
                          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">${roiTableRows}</table>`
                          : ""
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 20px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="left" style="padding:0;">
                            <a href="${escapeHtml(
                              args.actions.bookAgainUrl
                            )}" style="display:inline-block; background:${buttonBookAgain}; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; font-weight:800;">
                              ${escapeHtml(t("email.cta.bookAgain"))}
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
                        <div style="margin-bottom:8px;">
                          ${escapeHtml(t("email.text.footer"))}
                        </div>
                        <div style="padding-top:8px; border-top:1px solid ${border}; color:${muted}; font-size:11px; line-height:1.5;">
                          <strong>ClinvetIA</strong><br />
                          Soluciones de IA para clínicas veterinarias<br />
                          Email: <a href="mailto:info@clinvetia.com" style="color:${accent}; text-decoration:underline;">info@clinvetia.com</a><br />
                          Web: <a href="${escapeHtml(args.appUrl)}" style="color:${accent}; text-decoration:underline;">www.clinvetia.com</a>
                        </div>
                        <div style="margin-top:8px; color:${muted}; font-size:10px;">
                          Este es un correo transaccional relacionado con tu cita cancelada.
                        </div>
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
  textLines.push(t("email.text.cancelledIntro"))
  textLines.push("")
  textLines.push(`${t("email.labels.date")}: ${args.schedule.date}`)
  textLines.push(`${t("email.labels.time")}: ${args.schedule.startTime} - ${args.schedule.endTime}`)
  textLines.push(`${t("email.labels.timezone")}: ${args.schedule.displayTimeZone}`)
  textLines.push("")
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
  textLines.push("")
  textLines.push(`${t("email.cta.bookAgain")}: ${args.actions.bookAgainUrl}`)
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
