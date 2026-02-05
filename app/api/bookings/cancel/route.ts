import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { env } from "@/lib/env"
import { errorJson, okJson } from "@/lib/api/respond"
import { isApiError } from "@/lib/api/errors"
import { getNow } from "@/lib/booking/time"
import { cancelBookingByToken } from "@/lib/booking/cancel"

export const runtime = "nodejs"

function wantsJson(req: NextRequest): boolean {
  const accept = req.headers.get("accept")?.toLowerCase() ?? ""
  return accept.includes("application/json") || accept.includes("+json")
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  const now = getNow(req.headers)

  if (!token || token.trim().length < 10) {
    if (wantsJson(req)) {
      return errorJson("TOKEN_INVALID", "Invalid token.", { status: 400, fields: { token: "Missing" } })
    }
    return NextResponse.redirect(new URL(`/cancelado?status=error&code=TOKEN_INVALID&lang=es`, env.APP_URL))
  }

  try {
    const result = await cancelBookingByToken({ token, now })

    if (wantsJson(req)) {
      return okJson({})
    }

    const lang = result.bookingLocale
    return NextResponse.redirect(new URL(`/cancelado?status=ok&lang=${lang}`, env.APP_URL))
  } catch (error: unknown) {
    if (isApiError(error)) {
      if (wantsJson(req)) {
        return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
      }
      const lang = "es"
      return NextResponse.redirect(
        new URL(`/cancelado?status=error&code=${encodeURIComponent(error.code)}&lang=${lang}`, env.APP_URL)
      )
    }

    if (wantsJson(req)) {
      return errorJson("SERVICE_ERROR", "Service unavailable.", { status: 500 })
    }

    return NextResponse.redirect(new URL(`/cancelado?status=error&code=SERVICE_ERROR&lang=es`, env.APP_URL))
  }
}
