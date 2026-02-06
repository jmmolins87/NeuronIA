import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { errorJson, okJson } from "@/lib/api/respond"
import { ApiError, isApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/admin/auth"
import { toAdminBookingDetailDTO, toAdminBookingEventDTO } from "@/lib/admin/serializers"
import { getNow } from "@/lib/booking/time"
import { expireHolds } from "@/lib/booking/holds"

export const runtime = "nodejs"

const PatchSchema = z.object({
  internalNotes: z.string().max(2000),
})

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)"
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await ctx.params

    const now = getNow(req.headers)
    await expireHolds(prisma, now)

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new ApiError("NOT_FOUND", "Booking not found.", { status: 404 })

    const events = await prisma.bookingEvent.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return okJson({
      data: {
        booking: toAdminBookingDetailDTO(booking),
        events: events.map(toAdminBookingEventDTO),
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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await ctx.params

    let body: z.infer<typeof PatchSchema>
    try {
      const json = await req.json()
      const parsed = PatchSchema.safeParse(json)
      if (!parsed.success) {
        return errorJson("INVALID_INPUT", "Invalid request body.", {
          status: 400,
          fields: zodFieldErrors(parsed.error),
        })
      }
      body = parsed.data
    } catch {
      return errorJson("INVALID_INPUT", "Invalid JSON body.", { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { internalNotes: body.internalNotes },
    })

    return okJson({
      data: {
        booking: toAdminBookingDetailDTO(updated),
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
