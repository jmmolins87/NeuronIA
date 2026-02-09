import "server-only"

import { NextRequest } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdmin } from "@/lib/admin/middleware"
import { bookingConfig } from "@/lib/booking/config"
import { addDaysToIsoDate, getLocalDayBoundsUtc, parseIsoDate } from "@/lib/booking/time"
import { prisma } from "@/lib/prisma"
import { toResponse } from "@/lib/errors"

export const runtime = "nodejs"

const QuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["HELD", "CONFIRMED", "CANCELLED", "RESCHEDULED", "EXPIRED"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

/**
 * List Bookings - Admin Only (no CSRF required for GET)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.error

    const url = new URL(request.url)
    const parsed = QuerySchema.safeParse({
      dateFrom: url.searchParams.get("dateFrom") ?? undefined,
      dateTo: url.searchParams.get("dateTo") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    })

    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid query", { status: 400, fields: zodToFields(parsed.error) })
    }

    const { dateFrom, dateTo, status, q, page, pageSize } = parsed.data

    let startAtFilter: { gte?: Date; lt?: Date } | undefined
    if (dateFrom || dateTo) {
      const from = dateFrom ?? dateTo
      const to = dateTo ?? dateFrom

      if (!from || !to) {
        return errorJson("INVALID_INPUT", "Invalid date range", { status: 400 })
      }

      parseIsoDate(from)
      parseIsoDate(to)

      const start = getLocalDayBoundsUtc(from, bookingConfig.timeZone).start
      const toNextDay = addDaysToIsoDate(to, 1)
      const end = getLocalDayBoundsUtc(toNextDay, bookingConfig.timeZone).start
      startAtFilter = { gte: start, lt: end }
    }

    const where: Prisma.BookingWhereInput = {}
    if (startAtFilter) where.startAt = startAtFilter
    if (status) where.status = status
    if (q && q.trim().length > 0) {
      const query = q.trim()
      where.OR = [
        { contactName: { contains: query, mode: "insensitive" } },
        { contactEmail: { contains: query, mode: "insensitive" } },
        { contactPhone: { contains: query, mode: "insensitive" } },
      ]
    }

    const skip = (page - 1) * pageSize

    const [total, bookings] = await prisma.$transaction([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { startAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          status: true,
          startAt: true,
          endAt: true,
          timezone: true,
          locale: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          createdAt: true,
        },
      }),
    ])

    return okJson({
      page,
      pageSize,
      total,
      items: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        startAtISO: b.startAt.toISOString(),
        endAtISO: b.endAt.toISOString(),
        timezone: b.timezone,
        locale: b.locale,
        contactName: b.contactName ?? null,
        contactEmail: b.contactEmail ?? null,
        contactPhone: b.contactPhone ?? null,
        createdAtISO: b.createdAt.toISOString(),
      })),
    })
  } catch (error: unknown) {
    return toResponse(error)
  }
}
