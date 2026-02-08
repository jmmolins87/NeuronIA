import "server-only"

import { z } from "zod"

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function parseOkJson(res: Response): Promise<unknown> {
  const json = (await res.json().catch(() => null)) as unknown
  if (!isRecord(json) || typeof json.ok !== "boolean") {
    throw new Error("Invalid JSON from internal endpoint")
  }
  return json
}

function urlFromRequest(requestUrl: string, path: string): string {
  return new URL(path, requestUrl).toString()
}

function isAfter1930(time: string): boolean {
  // time in HH:mm
  return time > "19:30"
}

export async function toolGetAvailability(args: { requestUrl: string; date: string }) {
  DateSchema.parse(args.date)
  const url = urlFromRequest(args.requestUrl, `/api/availability?date=${encodeURIComponent(args.date)}`)
  const res = await fetch(url, { method: "GET", cache: "no-store" })
  return await parseOkJson(res)
}

export async function toolCreateHold(args: {
  requestUrl: string
  date: string
  time: string
  timezone: string
  locale: "es" | "en"
}) {
  DateSchema.parse(args.date)
  TimeSchema.parse(args.time)

  // Enforce product rule: do not allow times after 19:30.
  if (isAfter1930(args.time)) {
    return { ok: false, code: "CUTOFF_1930", message: "Time not allowed after 19:30" }
  }

  const url = urlFromRequest(args.requestUrl, "/api/bookings")
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      date: args.date,
      time: args.time,
      timezone: args.timezone,
      locale: args.locale,
    }),
  })
  return await parseOkJson(res)
}
