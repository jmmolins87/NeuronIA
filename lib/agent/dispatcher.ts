import "server-only"

import { Prisma } from "@prisma/client"
import type { AgentJob, AgentJobStatus, AgentJobType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface DispatchResult {
  enqueuedFromBookingEvents: {
    scanned: number
    enqueued: number
    alreadyEnqueued: number
    markedProcessed: number
  }
  claimed: number
  processed: number
  failed: number
  jobs: Array<{ id: string; type: AgentJobType; status: AgentJobStatus; attempts: number }>
}

function summarizeError(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Unknown error"
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

function nextRunAt(now: Date, attempts: number): Date {
  const backoffMinutes = Math.min(60, Math.max(1, Math.pow(2, attempts)))
  return addMinutes(now, backoffMinutes)
}

function coerceLocale(value: unknown): "es" | "en" {
  return value === "en" ? "en" : "es"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractLocaleFromJson(json: Prisma.JsonValue): "es" | "en" {
  if (isRecord(json)) {
    const value = json.locale
    if (value === "en" || value === "es") return value
  }
  return "es"
}

async function processBookingEventJob(job: AgentJob, now: Date): Promise<void> {
  const payload = job.payload as unknown as { bookingEventId?: string }
  const bookingEventId = payload.bookingEventId
  if (!bookingEventId) {
    throw new Error("Missing bookingEventId")
  }

  const event = await prisma.bookingEvent.findUnique({
    where: { id: bookingEventId },
    include: { booking: true },
  })

  if (!event || !event.booking) {
    throw new Error("BookingEvent not found")
  }

  const booking = event.booking
  const locale = extractLocaleFromJson(event.payloadJson) ?? coerceLocale(booking.locale)

  const summaryMap: Record<string, { es: string; en: string }> = {
    BOOKING_CONFIRMED: { es: "Cita confirmada", en: "Booking confirmed" },
    BOOKING_CANCELLED: { es: "Cita cancelada", en: "Booking cancelled" },
    BOOKING_RESCHEDULED: { es: "Cita reagendada", en: "Booking rescheduled" },
  }

  const summary = summaryMap[event.type]?.[locale] ?? `${event.type}`

  const textLines: string[] = []
  textLines.push(`[${event.type}] ${summary}`)
  textLines.push(`bookingId=${booking.id}`)
  textLines.push(`startAt=${booking.startAt.toISOString()}`)
  textLines.push(`timezone=${booking.timezone}`)

  const text = textLines.join("\n")

  const thread = await prisma.agentThread.upsert({
    where: {
      channel_externalId: {
        channel: "WEB_FORM",
        externalId: `booking:${booking.id}`,
      },
    },
    create: {
      channel: "WEB_FORM",
      externalId: `booking:${booking.id}`,
      locale,
      customerName: booking.contactName ?? null,
      customerEmail: booking.contactEmail ?? null,
      customerPhone: booking.contactPhone ?? null,
      status: "OPEN",
      lastMessageAt: now,
    },
    update: {
      locale,
      customerName: booking.contactName ?? undefined,
      customerEmail: booking.contactEmail ?? undefined,
      customerPhone: booking.contactPhone ?? undefined,
      lastMessageAt: now,
      status: "OPEN",
    },
  })

  await prisma.agentMessage.create({
    data: {
      threadId: thread.id,
      direction: "IN",
      text,
      raw: {
        kind: "BOOKING_EVENT",
        bookingEventId: event.id,
        type: event.type,
        payload: event.payloadJson,
      },
      createdAt: now,
    },
  })
}

async function processInboundMessageJob(job: AgentJob, now: Date): Promise<void> {
  // Placeholder: nothing to do besides marking DONE
  void now
  void job
}

async function markJobDone(jobId: string, now: Date): Promise<void> {
  await prisma.agentJob.update({
    where: { id: jobId },
    data: {
      status: "DONE",
      lastError: null,
      updatedAt: now,
    },
  })
}

async function markJobFailed(jobId: string, error: unknown, now: Date): Promise<void> {
  // We increment attempts and compute a new runAt for retry.
  const current = await prisma.agentJob.findUnique({ where: { id: jobId } })
  const attempts = (current?.attempts ?? 0) + 1

  await prisma.agentJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      attempts,
      lastError: summarizeError(error),
      runAt: nextRunAt(now, attempts),
      updatedAt: now,
    },
  })
}

export async function dispatchAgentJobs(args: {
  now?: Date
  take?: number
  enqueueFromBookingEvents: () => Promise<DispatchResult["enqueuedFromBookingEvents"]>
}): Promise<DispatchResult> {
  const now = args.now ?? new Date()
  const take = Math.max(1, Math.min(50, args.take ?? 10))

  const enqueuedFromBookingEvents = await args.enqueueFromBookingEvents()

  const claimed = await prisma.$transaction(async (tx) => {
    const candidates = await tx.agentJob.findMany({
      where: { status: { in: ["PENDING", "FAILED"] }, runAt: { lte: now } },
      orderBy: { runAt: "asc" },
      take,
    })

    if (candidates.length === 0) return [] as AgentJob[]

    const ids = candidates.map((j) => j.id)

    await tx.agentJob.updateMany({
      where: { id: { in: ids }, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PROCESSING" },
    })

    return await tx.agentJob.findMany({
      where: { id: { in: ids }, status: "PROCESSING" },
      orderBy: { runAt: "asc" },
    })
  })

  let processed = 0
  let failed = 0
  const jobSummaries: DispatchResult["jobs"] = []

  for (const job of claimed) {
    try {
      if (job.type === "PROCESS_BOOKING_EVENT") {
        await processBookingEventJob(job, now)
      } else if (job.type === "PROCESS_INBOUND_MESSAGE") {
        await processInboundMessageJob(job, now)
      } else {
        throw new Error(`Unsupported job type: ${job.type}`)
      }

      await markJobDone(job.id, now)
      processed++
      jobSummaries.push({ id: job.id, type: job.type, status: "DONE", attempts: job.attempts })
    } catch (error: unknown) {
      await markJobFailed(job.id, error, now)
      failed++
      jobSummaries.push({ id: job.id, type: job.type, status: "FAILED", attempts: job.attempts + 1 })
    }
  }

  return {
    enqueuedFromBookingEvents,
    claimed: claimed.length,
    processed,
    failed,
    jobs: jobSummaries,
  }
}
