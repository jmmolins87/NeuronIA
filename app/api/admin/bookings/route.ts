import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { isApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/admin/auth"
import { parseAdminBookingsQuery, buildBookingsWhere, getPagination } from "@/lib/admin/queries"
import { toAdminBookingListItemDTO } from "@/lib/admin/serializers"
import { getNow } from "@/lib/booking/time"
import { expireHolds } from "@/lib/booking/holds"

export const runtime = "nodejs"

// Default ordering: startAt DESC (most recent appointments first).
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)

    const parsed = parseAdminBookingsQuery(req.nextUrl.searchParams)
    if (!parsed.ok) {
      return errorJson("INVALID_INPUT", "Invalid query parameters.", { status: 400, fields: parsed.fields })
    }

    const { from, to, status, q, page, pageSize } = parsed.data
    const now = getNow(req.headers)
    await expireHolds(prisma, now)

    const where = buildBookingsWhere({ from, to, status, q })
    const { skip, take } = getPagination(page, pageSize)

    const [totalItems, rows] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy: { startAt: "desc" },
        skip,
        take,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    return okJson({
      data: {
        items: rows.map(toAdminBookingListItemDTO),
        page,
        pageSize,
        totalItems,
        totalPages,
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
