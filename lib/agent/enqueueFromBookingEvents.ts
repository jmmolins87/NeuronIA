import "server-only"

import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const BOOKING_EVENT_TYPES = new Set(["BOOKING_CONFIRMED", "BOOKING_CANCELLED", "BOOKING_RESCHEDULED"])

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

export interface EnqueueFromBookingEventsResult {
  scanned: number
  enqueued: number
  alreadyEnqueued: number
  markedProcessed: number
}

export async function enqueueFromBookingEvents(args?: {
  take?: number
  now?: Date
}): Promise<EnqueueFromBookingEventsResult> {
  const take = Math.max(1, Math.min(100, args?.take ?? 50))
  const now = args?.now ?? new Date()

  return await prisma.$transaction(async (tx) => {
    const events = await tx.bookingEvent.findMany({
      where: {
        processedAt: null,
        type: { in: Array.from(BOOKING_EVENT_TYPES) },
      },
      orderBy: { createdAt: "asc" },
      take,
    })

    let enqueued = 0
    let alreadyEnqueued = 0
    let markedProcessed = 0

    for (const event of events) {
      try {
        await tx.agentJob.create({
          data: {
            type: "PROCESS_BOOKING_EVENT",
            payload: { bookingEventId: event.id },
            bookingEventId: event.id,
            status: "PENDING",
            runAt: now,
          },
        })
        enqueued++
      } catch (error: unknown) {
        if (isUniqueConstraintError(error)) {
          alreadyEnqueued++
        } else {
          throw error
        }
      }

      const updated = await tx.bookingEvent.updateMany({
        where: { id: event.id, processedAt: null },
        data: { processedAt: now },
      })
      markedProcessed += updated.count
    }

    return {
      scanned: events.length,
      enqueued,
      alreadyEnqueued,
      markedProcessed,
    }
  })
}
