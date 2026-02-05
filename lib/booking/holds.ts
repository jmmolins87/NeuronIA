import type { Prisma, PrismaClient } from "@prisma/client"

export async function expireHolds(
  prisma: PrismaClient | Prisma.TransactionClient,
  now: Date
): Promise<number> {
  const res = await prisma.booking.updateMany({
    where: {
      status: "HELD",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  })

  return res.count
}
