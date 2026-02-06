import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { ApiError, isApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/admin/auth"
import { createBookingEvent } from "@/lib/booking/events"
import { getNow } from "@/lib/booking/time"
import { expireHolds } from "@/lib/booking/holds"

export const runtime = "nodejs"

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await ctx.params
    const now = getNow(req.headers)

    await expireHolds(prisma, now)

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new ApiError("NOT_FOUND", "Booking not found.", { status: 404 })

    if (booking.status === "CANCELLED") {
      return okJson({})
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          expiresAt: null,
        },
      })

      await createBookingEvent(tx, id, "ADMIN_CANCELLED", { admin: true })
    })

    return okJson({})
  } catch (error: unknown) {
    if (isApiError(error)) {
      return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, code: "SERVICE_ERROR", message }, { status: 500 })
  }
}
