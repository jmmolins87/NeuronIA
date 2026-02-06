import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { isApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/admin/auth"
import { getNow, nextDayStartUtc, parseDateYYYYMMDD, startOfDayUtc } from "@/lib/booking/time"
import { expireHolds } from "@/lib/booking/holds"

export const runtime = "nodejs"

const QuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)"
    if (!out[key]) out[key] = issue.message
  }
  return out
}

function formatYYYYMMDD(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d)
  const year = parts.find((p) => p.type === "year")?.value
  const month = parts.find((p) => p.type === "month")?.value
  const day = parts.find((p) => p.type === "day")?.value
  return `${year}-${month}-${day}`
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)

    const raw = {
      from: req.nextUrl.searchParams.get("from") ?? undefined,
      to: req.nextUrl.searchParams.get("to") ?? undefined,
    }

    const parsed = QuerySchema.safeParse(raw)
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid query parameters.", {
        status: 400,
        fields: zodFieldErrors(parsed.error),
      })
    }

    const now = getNow(req.headers)
    await expireHolds(prisma, now)

    const defaultTo = formatYYYYMMDD(now, env.BOOKING_TIMEZONE)
    const defaultFrom = formatYYYYMMDD(new Date(now.getTime() - 30 * 24 * 60 * 60_000), env.BOOKING_TIMEZONE)

    const from = parsed.data.from ?? defaultFrom
    const to = parsed.data.to ?? defaultTo

    const fields: Record<string, string> = {}
    if (!parseDateYYYYMMDD(from)) fields.from = "Expected YYYY-MM-DD"
    if (!parseDateYYYYMMDD(to)) fields.to = "Expected YYYY-MM-DD"
    if (from > to) fields.to = "Must be >= from"
    if (Object.keys(fields).length > 0) {
      return errorJson("INVALID_INPUT", "Invalid query parameters.", { status: 400, fields })
    }

    const rangeStart = startOfDayUtc(from, env.BOOKING_TIMEZONE)
    const rangeEnd = nextDayStartUtc(to, env.BOOKING_TIMEZONE)

    const baseWhere = {
      startAt: { gte: rangeStart, lt: rangeEnd },
    } as const

    const [
      totalBookings,
      confirmed,
      cancelled,
      expired,
      heldActive,
      rescheduled,
    ] = await Promise.all([
      prisma.booking.count({ where: baseWhere }),
      prisma.booking.count({ where: { ...baseWhere, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { ...baseWhere, status: "CANCELLED" } }),
      prisma.booking.count({ where: { ...baseWhere, status: "EXPIRED" } }),
      prisma.booking.count({ where: { ...baseWhere, status: "HELD", expiresAt: { gt: now } } }),
      prisma.booking.count({ where: { ...baseWhere, rescheduledAt: { not: null }, status: "CONFIRMED" } }),
    ])

    return okJson({
      data: {
        range: {
          from,
          to,
          timezone: env.BOOKING_TIMEZONE,
        },
        totals: {
          totalBookings,
          confirmed,
          heldActive,
          cancelled,
          rescheduled,
          expired,
        },
      },
    })
  } catch (error: unknown) {
    if (isApiError(error)) {
      return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, code: "SERVICE_ERROR", message }, { status: 500 })
  }
}
