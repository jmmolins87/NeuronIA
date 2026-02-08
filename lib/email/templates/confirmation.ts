import "server-only"

import type { Prisma } from "@prisma/client"

import type { EmailLocale } from "@/lib/i18n/stringsEmail"
import { getEmailStrings } from "@/lib/i18n/stringsEmail"

export interface ConfirmationEmailTemplateArgs {
  locale: EmailLocale
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
    contactMessage: string | null
    roiData: Prisma.JsonValue | null
  }
  schedule: {
    date: string
    startTime: string
    endTime: string
    durationMinutes: number
    displayTimeZone: string
  }
  actions: {
    rescheduleUrl: string
    cancelUrl: string
    icsUrl: string
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatMaybe(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value.trim() : "-"
}

function formatMultilineHtml(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />")
}

function getRoiKeyValues(roi: Prisma.JsonValue | null): Array<{ key: string; value: string }> {
  if (!roi || typeof roi !== "object" || Array.isArray(roi)) return []
  const record = roi as Record<string, unknown>
  const entries: Array<{ key: string; value: string }> = []
  for (const [key, val] of Object.entries(record)) {
    if (entries.length >= 10) break
    if (val === null) continue
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
      entries.push({ key, value: String(val) })
    }
  }
  return entries
}

function getRoiNumber(roi: Prisma.JsonValue | null, key: string): number | null {
  if (!roi || typeof roi !== "object" || Array.isArray(roi)) return null
  const record = roi as Record<string, unknown>
  const value = record[key]
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

function formatNumber(value: number, locale: EmailLocale): string {
  const intl = locale === "en" ? "en-GB" : "es-ES"
  return new Intl.NumberFormat(intl, { maximumFractionDigits: 0 }).format(value)
}

function formatEuro(value: number, locale: EmailLocale): string {
  return `${formatNumber(value, locale)}€`
}

function formatPercentSigned(value: number, locale: EmailLocale): string {
  const n = Math.round(value)
  const abs = Math.abs(n)
  const formatted = formatNumber(abs, locale)
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  return `${sign}${formatted}%`
}

export function buildHtml(args: ConfirmationEmailTemplateArgs): string {
  const { t } = getEmailStrings(args.locale)

  const contactRows = [
    { label: t("email.confirmation.labels.contactName"), value: formatMaybe(args.booking.contactName) },
    { label: t("email.confirmation.labels.contactEmail"), value: formatMaybe(args.booking.contactEmail) },
    { label: t("email.confirmation.labels.contactPhone"), value: formatMaybe(args.booking.contactPhone) },
    { label: t("email.confirmation.labels.clinicName"), value: formatMaybe(args.booking.contactClinicName) },
  ]

  const messageLabel = t("email.confirmation.labels.message")
  if (args.booking.contactMessage && args.booking.contactMessage.trim().length > 0) {
    contactRows.push({ label: messageLabel, value: args.booking.contactMessage })
  }

  const roiKv = getRoiKeyValues(args.booking.roiData)
  const roiMonthlyRevenue = getRoiNumber(args.booking.roiData, "monthlyRevenue")
  const roiYearlyRevenue = getRoiNumber(args.booking.roiData, "yearlyRevenue")
  const roiPercent = getRoiNumber(args.booking.roiData, "roi")

  const logoUrl = `${args.appUrl.replace(/\/$/, "")}/logo.png`

  const subject = t("email.confirmation.subject")
  const preheader = t("email.confirmation.preheader", {
    date: args.schedule.date,
    time: args.schedule.startTime,
  })

  const primary = "#0F2D3F"
  const bg = "#F6F7F9"
  const card = "#FFFFFF"
  const text = "#0B1220"
  const muted = "#5B6472"
  const border = "#E6E8ED"
  
  // Button colors matching app components
  const buttonReschedule = "#0ea5e9"  // DemoButton blue (sky-500)
  const buttonCancel = "#dc2626"       // CancelButton red (destructive)

  function row(label: string, value: string, multiline?: boolean): string {
    const renderedValue = multiline ? formatMultilineHtml(value) : escapeHtml(value)
    return `
      <tr>
        <td style="padding:10px 12px; border-top:1px solid ${border}; color:${muted}; width:38%; font-size:13px; vertical-align:top;">${escapeHtml(
          label
        )}</td>
        <td style="padding:10px 12px; border-top:1px solid ${border}; color:${text}; font-size:13px; vertical-align:top;">${renderedValue}</td>
      </tr>
    `
  }

  const contactTableRows = contactRows
    .map((r) => row(r.label, r.value, r.label === messageLabel))
    .join("")

  const roiHasAny = roiKv.length > 0 || roiMonthlyRevenue !== null || roiYearlyRevenue !== null || roiPercent !== null

  return `<!doctype html>
<html lang="${args.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background:${bg};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(
      preheader
    )}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%;">
            <tr>
              <td style="padding:8px 8px 18px 8px;">
                <img src="${escapeHtml(logoUrl)}" width="140" alt="ClinvetIA" style="display:block; border:0; outline:none; text-decoration:none;" />
              </td>
            </tr>
            <tr>
              <td style="background:${card}; border:1px solid ${border}; border-radius:16px; overflow:hidden;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:20px 20px 10px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:20px; line-height:1.25; color:${text}; font-weight:700;">
                        ${escapeHtml(t("email.confirmation.title"))}
                      </div>
                      <div style="margin-top:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; line-height:1.6; color:${muted};">
                        ${escapeHtml(t("email.confirmation.intro"))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 18px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                        ${row(t("email.confirmation.labels.date"), args.schedule.date)}
                        ${row(t("email.confirmation.labels.time"), `${args.schedule.startTime} - ${args.schedule.endTime}`)}
                        ${row(t("email.confirmation.labels.duration"), t("email.confirmation.durationMinutes", { minutes: args.schedule.durationMinutes }))}
                        ${row(t("email.confirmation.labels.timezone"), args.schedule.displayTimeZone)}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 12px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                        ${escapeHtml(t("email.confirmation.contact.title"))}
                      </div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px; border:1px solid ${border}; border-radius:12px; overflow:hidden;">
                        ${contactTableRows}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 18px 20px;">
                      <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; color:${text}; font-weight:700;">
                        ${escapeHtml(t("email.confirmation.roi.title"))}
                      </div>
                      <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; line-height:1.6; color:${muted};">
                        ${escapeHtml(t("email.confirmation.roi.subtitle"))}
                      </div>
                      ${
                        roiHasAny
                          ? `
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                              <tr>
                                <td width="33.33%" valign="top" style="padding:0 8px 0 0;">
                                  <div style="border:1px solid ${border}; border-radius:12px; padding:12px; background:${bg};">
                                    <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:${muted}; font-weight:700;">${escapeHtml(
                                      t("email.confirmation.roi.cards.monthlyLabel")
                                    )}</div>
                                    <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:20px; color:${text}; font-weight:800;">${escapeHtml(
                                      roiMonthlyRevenue !== null ? formatEuro(roiMonthlyRevenue, args.locale) : "-"
                                    )}</div>
                                  </div>
                                </td>
                                <td width="33.33%" valign="top" style="padding:0 4px;">
                                  <div style="border:1px solid ${border}; border-radius:12px; padding:12px; background:${bg};">
                                    <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:${muted}; font-weight:700;">${escapeHtml(
                                      t("email.confirmation.roi.cards.annualLabel")
                                    )}</div>
                                    <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:20px; color:${text}; font-weight:800;">${escapeHtml(
                                      roiYearlyRevenue !== null ? formatEuro(roiYearlyRevenue, args.locale) : "-"
                                    )}</div>
                                  </div>
                                </td>
                                <td width="33.33%" valign="top" style="padding:0 0 0 8px;">
                                  <div style="border:1px solid ${border}; border-radius:12px; padding:12px; background:${bg};">
                                    <div style="font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; color:${muted}; font-weight:700;">${escapeHtml(
                                      t("email.confirmation.roi.cards.roiLabel")
                                    )}</div>
                                    <div style="margin-top:8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:20px; color:${text}; font-weight:800;">${escapeHtml(
                                      roiPercent !== null ? formatPercentSigned(roiPercent, args.locale) : "-"
                                    )}</div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          `
                          : `<div style="margin-top:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:13px; color:${muted};">${escapeHtml(
                              t("email.confirmation.roi.empty")
                            )}</div>`
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 20px 20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="left" style="padding:0;">
                            <a href="${escapeHtml(
                              args.actions.rescheduleUrl
                            )}" style="display:inline-block; background:${buttonReschedule}; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; font-weight:700;">
                              ${escapeHtml(t("email.confirmation.cta.reschedule"))}
                            </a>
                          </td>
                          <td align="right" style="padding:0;">
                            <a href="${escapeHtml(
                              args.actions.cancelUrl
                            )}" style="display:inline-block; background:${buttonCancel}; color:#fff; text-decoration:none; padding:12px 16px; border-radius:10px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; font-weight:700;">
                              ${escapeHtml(t("email.confirmation.cta.cancel"))}
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:14px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; line-height:1.6; color:${muted};">
                        ${escapeHtml(t("email.confirmation.ics.fallback"))}
                        <a href="${escapeHtml(
                          args.actions.icsUrl
                        )}" style="color:${primary}; text-decoration:underline;">${escapeHtml(
                          args.actions.icsUrl
                        )}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 8px 0 8px; font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; line-height:1.6; color:${muted};">
                <div style="margin-bottom:8px;">
                  ${escapeHtml(t("email.confirmation.footer"))}
                </div>
                <div style="padding-top:8px; border-top:1px solid ${border}; color:${muted}; font-size:11px; line-height:1.5;">
                  <strong>ClinvetIA</strong><br />
                  Soluciones de IA para clínicas veterinarias<br />
                  Email: <a href="mailto:info@clinvetia.com" style="color:${muted}; text-decoration:underline;">info@clinvetia.com</a><br />
                  Web: <a href="${escapeHtml(args.appUrl)}" style="color:${muted}; text-decoration:underline;">www.clinvetia.com</a>
                </div>
                <div style="margin-top:8px; color:${muted}; font-size:10px;">
                  Este es un correo transaccional relacionado con tu reserva de demostración.<br />
                  Para cancelar tu cita, haz clic en el botón "Cancelar" arriba.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function buildText(args: ConfirmationEmailTemplateArgs): string {
  const { t } = getEmailStrings(args.locale)
  const lines: string[] = []

  lines.push(t("email.confirmation.title"))
  lines.push("")
  lines.push(t("email.confirmation.intro"))
  lines.push("")
  lines.push(`${t("email.confirmation.labels.date")}: ${args.schedule.date}`)
  lines.push(`${t("email.confirmation.labels.time")}: ${args.schedule.startTime} - ${args.schedule.endTime}`)
  lines.push(
    `${t("email.confirmation.labels.duration")}: ${t("email.confirmation.durationMinutes", {
      minutes: args.schedule.durationMinutes,
    })}`
  )
  lines.push(`${t("email.confirmation.labels.timezone")}: ${args.schedule.displayTimeZone}`)
  lines.push("")

  lines.push(t("email.confirmation.contact.title"))
  lines.push(`${t("email.confirmation.labels.contactName")}: ${formatMaybe(args.booking.contactName)}`)
  lines.push(`${t("email.confirmation.labels.contactEmail")}: ${formatMaybe(args.booking.contactEmail)}`)
  lines.push(`${t("email.confirmation.labels.contactPhone")}: ${formatMaybe(args.booking.contactPhone)}`)
  lines.push(`${t("email.confirmation.labels.clinicName")}: ${formatMaybe(args.booking.contactClinicName)}`)
  if (args.booking.contactMessage && args.booking.contactMessage.trim().length > 0) {
    lines.push(`${t("email.confirmation.labels.message")}: ${args.booking.contactMessage.trim()}`)
  }
  lines.push("")

  lines.push(t("email.confirmation.roi.title"))
  const roiKv = getRoiKeyValues(args.booking.roiData)
  const monthly = getRoiNumber(args.booking.roiData, "monthlyRevenue")
  const yearly = getRoiNumber(args.booking.roiData, "yearlyRevenue")
  const roi = getRoiNumber(args.booking.roiData, "roi")
  const hasAny = roiKv.length > 0 || monthly !== null || yearly !== null || roi !== null

  if (!hasAny) {
    lines.push(t("email.confirmation.roi.empty"))
  } else {
    lines.push(`${t("email.confirmation.roi.cards.monthlyLabel")}: ${monthly !== null ? formatEuro(monthly, args.locale) : "-"}`)
    lines.push(`${t("email.confirmation.roi.cards.annualLabel")}: ${yearly !== null ? formatEuro(yearly, args.locale) : "-"}`)
    lines.push(`${t("email.confirmation.roi.cards.roiLabel")}: ${roi !== null ? formatPercentSigned(roi, args.locale) : "-"}`)
  }
  lines.push("")

  lines.push(`${t("email.confirmation.cta.reschedule")}: ${args.actions.rescheduleUrl}`)
  lines.push(`${t("email.confirmation.cta.cancel")}: ${args.actions.cancelUrl}`)
  lines.push("")
  lines.push(`${t("email.confirmation.ics.fallback")} ${args.actions.icsUrl}`)
  lines.push("")
  lines.push(t("email.confirmation.footer"))

  return lines.join("\n")
}
