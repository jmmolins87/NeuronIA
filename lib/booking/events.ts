import "server-only"

import type { PrismaClient, Prisma } from "@prisma/client"

export async function createBookingEvent(
  prisma: PrismaClient | Prisma.TransactionClient,
  bookingId: string,
  type: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  await prisma.bookingEvent.create({
    data: {
      bookingId,
      type,
      metadata: metadata ?? {},
    },
  })
}
