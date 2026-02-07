import "server-only"

import { okJson, errorJson } from "@/lib/api/respond"
import { env } from "@/lib/env"
import { enqueueFromBookingEvents } from "@/lib/agent/enqueueFromBookingEvents"
import { dispatchAgentJobs } from "@/lib/agent/dispatcher"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const secret = env.CRON_SECRET
  if (!secret) {
    return errorJson("CRON_NOT_CONFIGURED", "CRON_SECRET is not configured", { status: 500 })
  }

  const provided = request.headers.get("x-cron-secret")
  if (!provided || provided !== secret) {
    return errorJson("UNAUTHORIZED", "Invalid cron secret", { status: 401 })
  }

  const url = new URL(request.url)
  const takeParam = url.searchParams.get("take")
  const take = takeParam ? Number(takeParam) : 10

  if (!Number.isFinite(take) || take <= 0) {
    return errorJson("INVALID_INPUT", "Invalid take", { status: 400, fields: { take: "Expected a positive number" } })
  }

  const now = new Date()

  const result = await dispatchAgentJobs({
    now,
    take,
    enqueueFromBookingEvents: () => enqueueFromBookingEvents({ now, take: 50 }),
  })

  return okJson({ nowISO: now.toISOString(), result })
}
