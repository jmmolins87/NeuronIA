import "server-only"

import type { Prisma } from "@prisma/client"

export interface CalendarLinks {
  googleUrl: string
  outlookUrl: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function formatMaybe(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value.trim() : "-"
}

export function safeJsonStringify(value: unknown, maxChars: number): string {
  try {
    const json = JSON.stringify(value, null, 2)
    if (!json) return ""
    if (json.length <= maxChars) return json
    return `${json.slice(0, maxChars)}\n...`
  } catch {
    return ""
  }
}

export function getRoiKeyValues(roi: Prisma.JsonValue | null): Array<{ key: string; value: string }> {
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

function formatGoogleDateUtc(date: Date): string {
  // Google expects YYYYMMDDTHHMMSSZ
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
}

export function buildCalendarLinks(args: {
  title: string
  details: string
  location?: string
  startUtc: Date
  endUtc: Date
}): CalendarLinks {
  const title = encodeURIComponent(args.title)
  const details = encodeURIComponent(args.details)
  const location = encodeURIComponent(args.location ?? "")
  const dates = `${formatGoogleDateUtc(args.startUtc)}/${formatGoogleDateUtc(args.endUtc)}`

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${encodeURIComponent(
    dates
  )}&details=${details}&location=${location}`

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${encodeURIComponent(
    args.startUtc.toISOString()
  )}&enddt=${encodeURIComponent(args.endUtc.toISOString())}&location=${location}`

  return { googleUrl, outlookUrl }
}
