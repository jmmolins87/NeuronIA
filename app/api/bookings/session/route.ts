import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { okJson, errorJson } from "@/lib/api/respond"
import { expireHolds } from "@/lib/booking/holds"
import { getNow } from "@/lib/booking/time"

export const runtime = "nodejs"

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token || token.trim().length < 10) {
    return errorJson("INVALID_TOKEN", "Invalid token.", {
      fields: { token: "Missing or invalid" },
    })
  }

  const now = getNow(req.headers)
  const tokenHash = sha256Hex(token)

  try {
    await expireHolds(prisma, now)

    const session = await prisma.bookingToken.findFirst({
      where: {
        kind: "SESSION",
        tokenHash,
      },
      include: {
        booking: true,
      },
    })

    if (!session) {
      return errorJson("SESSION_NOT_FOUND", "Session not found.", { status: 404 })
    }

    if (session.expiresAt <= now) {
      return errorJson("SESSION_EXPIRED", "Session expired.", { status: 410 })
    }

    if (session.usedAt) {
      return errorJson("SESSION_USED", "Session already used.", { status: 410 })
    }

    const b = session.booking
    if (b.status !== "HELD") {
      return errorJson("BOOKING_NOT_ACTIVE", "Booking is not active.", { status: 409 })
    }

    if (b.expiresAt && b.expiresAt <= now) {
      return errorJson("BOOKING_EXPIRED", "Booking hold expired.", { status: 410 })
    }

    return okJson({
      booking: {
        id: b.id,
        status: b.status,
        startAt: b.startAt.toISOString(),
        endAt: b.endAt.toISOString(),
        timezone: b.timezone,
        locale: b.locale,
        customerEmail: b.customerEmail,
        customerName: b.customerName,
        internalNotes: b.internalNotes,
        formData: b.formData,
        roiData: b.roiData,
        expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
      },
      sessionExpiresAt: session.expiresAt.toISOString(),
    })
  } catch (error: unknown) {
    const message =
      env.NODE_ENV === "production"
        ? "Service unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return NextResponse.json(
      { ok: false, code: "SESSION_LOOKUP_FAILED", message },
      { status: 500 }
    )
  }
}
