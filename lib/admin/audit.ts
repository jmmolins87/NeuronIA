import "server-only"

import type { Prisma, PrismaClient } from "@prisma/client"

import { adminLogger } from "./logger"

/**
 * Audit logging for admin actions
 * All admin mutations must create audit records
 */

export interface BookingAuditMetadata {
  ip?: string
  userAgent?: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  reason?: string
  [key: string]: unknown
}

export interface UserAuditMetadata {
  ip?: string
  userAgent?: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown
>
  username?: string
  email?: string
  role?: string
  [key: string]: unknown
}

export async function createBookingAudit(
  prisma: PrismaClient | Prisma.TransactionClient,
  data: {
    adminId: string
    bookingId: string
    action: string
    metadata?: BookingAuditMetadata
  }
): Promise<void> {
  try {
    await (prisma as PrismaClient).bookingAdminAudit.create({
      data: {
        adminId: data.adminId,
        bookingId: data.bookingId,
        action: data.action,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    })

    adminLogger.info("Booking audit created", {
      adminId: data.adminId,
      bookingId: data.bookingId,
      action: data.action,
    })
  } catch (error) {
    adminLogger.error("Failed to create booking audit", {
      adminId: data.adminId,
      bookingId: data.bookingId,
      action: data.action,
      error: error instanceof Error ? error.message : String(error),
    })
    // Re-throw to ensure audit failure fails the transaction
    throw new Error("Audit logging failed")
  }
}

export async function createUserAudit(
  prisma: PrismaClient | Prisma.TransactionClient,
  data: {
    adminId: string
    targetAdminId?: string | null
    action: string
    metadata?: UserAuditMetadata
  }
): Promise<void> {
  try {
    await (prisma as PrismaClient).userAdminAudit.create({
      data: {
        adminId: data.adminId,
        targetAdminId: data.targetAdminId ?? null,
        action: data.action,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    })

    adminLogger.info("User audit created", {
      adminId: data.adminId,
      targetAdminId: data.targetAdminId,
      action: data.action,
    })
  } catch (error) {
    adminLogger.error("Failed to create user audit", {
      adminId: data.adminId,
      targetAdminId: data.targetAdminId,
      action: data.action,
      error: error instanceof Error ? error.message : String(error),
    })
    // Re-throw to ensure audit failure fails the transaction
    throw new Error("Audit logging failed")
  }
}

export async function getBookingAuditLog(
  prisma: PrismaClient,
  bookingId: string,
  options?: {
    limit?: number
    offset?: number
  }
) {
  return prisma.bookingAdminAudit.findMany({
    where: { bookingId },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  })
}

export async function getUserAuditLog(
  prisma: PrismaClient,
  targetAdminId: string,
  options?: {
    limit?: number
    offset?: number
  }
) {
  return prisma.userAdminAudit.findMany({
    where: { targetAdminId },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  })
}

export async function getAdminActivityLog(
  prisma: PrismaClient,
  adminId: string,
  options?: {
    limit?: number
    offset?: number
  }
) {
  const [bookingAudits, userAudits] = await Promise.all([
    prisma.bookingAdminAudit.findMany({
      where: { adminId },
      include: {
        booking: {
          select: {
            id: true,
            uid: true,
            contactName: true,
            contactEmail: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.userAdminAudit.findMany({
      where: { adminId },
      include: {
        targetAdmin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
  ])

  return {
    bookingAudits,
    userAudits,
  }
}
