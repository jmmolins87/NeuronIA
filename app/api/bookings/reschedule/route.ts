import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { env } from "@/lib/env"
import { errorJson, okJson } from "@/lib/api/respond"
import { isApiError } from "@/lib/api/errors"
import { getNow } from "@/lib/booking/time"
import { rescheduleBookingByToken, validateRescheduleToken } from "@/lib/booking/reschedule"

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
    return NextResponse.redirect(new URL(`/reagendar?status=error&code=TOKEN_INVALID&lang=es`, env.APP_URL))
  }

  try {
    const validated = await validateRescheduleToken({ token, now })
    const lang = validated.bookingLocale
    return NextResponse.redirect(
      new URL(`/reagendar?token=${encodeURIComponent(token)}&lang=${lang}`, env.APP_URL)
    )
  } catch (error: unknown) {
    if (isApiError(error)) {
      if (wantsJson(req)) {
        return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
      }
      return NextResponse.redirect(
        new URL(
          `/reagendar?status=error&code=${encodeURIComponent(error.code)}&token=${encodeURIComponent(token)}&lang=es`,
          env.APP_URL
        )
      )
    }

    if (wantsJson(req)) {
      return errorJson("SERVICE_ERROR", "Service unavailable.", { status: 500 })
    }

    return NextResponse.redirect(
      new URL(`/reagendar?status=error&code=SERVICE_ERROR&token=${encodeURIComponent(token)}&lang=es`, env.APP_URL)
    )
  }
}

const PostSchema = z.object({
  token: z.string().min(10),
  newDate: z.string(),
  newTime: z.string(),
  durationMinutes: z.number().int().positive().optional(),
  locale: z.enum(["es", "en"]).optional(),
})

function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)"
    if (!out[key]) out[key] = issue.message
  }
  return out
}

export async function POST(req: NextRequest) {
  const now = getNow(req.headers)

  let body: z.infer<typeof PostSchema>
  try {
    const json = await req.json()
    const parsed = PostSchema.safeParse(json)
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

  try {
    await rescheduleBookingByToken({
      token: body.token,
      now,
      newDate: body.newDate,
      newTime: body.newTime,
      durationMinutes: body.durationMinutes,
      locale: body.locale,
    })
    return okJson({})
  } catch (error: unknown) {
    if (isApiError(error)) {
      return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
    }
    const message =
      env.NODE_ENV === "production"
        ? "Service unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"
    return NextResponse.json({ ok: false, code: "SERVICE_ERROR", message }, { status: 500 })
  }
}
