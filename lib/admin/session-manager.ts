import "server-only"

import { randomBytes } from "crypto"
import type { PrismaClient } from "@prisma/client"
import type { AdminUser } from "@prisma/client"

import { env } from "@/lib/env"
import { ADMIN_SECURITY } from "./constants"
import { generateCsrfToken } from "./csrf"
import { enforceSuperAdminMode } from "./enforcement"

/**
 * Session Management with database-backed sessions
 */

export interface AdminSessionData {
  id: string
  sessionToken: string
  csrfToken: string
  adminId: string
  expiresAt: Date
  createdAt: Date
  lastUsedAt: Date
  admin: Pick<AdminUser, "id" | "username" | "email" | "role" | "mode" | "isActive">
}

function getSessionTTLDays(): number {
  const envValue = process.env.SESSION_TTL_DAYS
  if (envValue) {
    const parsed = parseInt(envValue, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  return ADMIN_SECURITY.SESSION.TTL_DAYS_DEFAULT
}

export function generateSessionToken(): string {
  return randomBytes(48).toString("base64url")
}

export async function createSession(
  prisma: PrismaClient,
  admin: Pick<AdminUser, "id" | "username" | "email" | "role" | "mode" | "isActive">,
  options?: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<AdminSessionData> {
  const sessionToken = generateSessionToken()
  const csrfToken = generateCsrfToken()
  const ttlDays = getSessionTTLDays()
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000)

  const session = await prisma.adminSession.create({
    data: {
      sessionToken,
      csrfToken,
      adminId: admin.id,
      expiresAt,
      ipAddress: options?.ipAddress ?? null,
      userAgent: options?.userAgent ?? null,
    },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          mode: true,
          isActive: true,
        },
      },
    },
  })

  return {
    id: session.id,
    sessionToken: session.sessionToken,
    csrfToken: session.csrfToken,
    adminId: session.adminId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    admin: session.admin,
  }
}

export async function getSessionByToken(
  prisma: PrismaClient,
  sessionToken: string
): Promise<AdminSessionData | null> {
  const session = await prisma.adminSession.findUnique({
    where: { sessionToken },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          mode: true,
          isActive: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } })
    return null
  }

  // Check if admin is inactive
  if (!session.admin.isActive) {
    await prisma.adminSession.delete({ where: { id: session.id } })
    return null
  }

  // Enforce mode constraints (SUPER_ADMIN must be REAL)
  const enforcementResult = await enforceSuperAdminMode(session.admin)
  
  // If mode was corrected, refetch the admin to get updated data
  let finalAdmin = session.admin
  if (enforcementResult.corrected) {
    const updatedAdmin = await prisma.adminUser.findUnique({
      where: { id: session.admin.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        mode: true,
        isActive: true,
      },
    })
    
    if (updatedAdmin) {
      finalAdmin = updatedAdmin
    }
  }

  return {
    id: session.id,
    sessionToken: session.sessionToken,
    csrfToken: session.csrfToken,
    adminId: session.adminId,
    expiresAt: session.expiresAt,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    admin: finalAdmin,
  }
}

export async function renewSession(
  prisma: PrismaClient,
  sessionToken: string
): Promise<AdminSessionData | null> {
  const session = await getSessionByToken(prisma, sessionToken)

  if (!session) {
    return null
  }

  const now = new Date()
  const timeUntilExpiry = session.expiresAt.getTime() - now.getTime()

  // Sliding session: renew if less than 24 hours remaining
  if (timeUntilExpiry < ADMIN_SECURITY.SESSION.SLIDING_THRESHOLD_MS) {
    const ttlDays = getSessionTTLDays()
    const newExpiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000)

    const updated = await prisma.adminSession.update({
      where: { id: session.id },
      data: {
        expiresAt: newExpiresAt,
        lastUsedAt: now,
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            mode: true,
            isActive: true,
          },
        },
      },
    })

    return {
      id: updated.id,
      sessionToken: updated.sessionToken,
      csrfToken: updated.csrfToken,
      adminId: updated.adminId,
      expiresAt: updated.expiresAt,
      createdAt: updated.createdAt,
      lastUsedAt: updated.lastUsedAt,
      admin: updated.admin,
    }
  }

  // Update lastUsedAt
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastUsedAt: now },
  })

  return session
}

export async function invalidateSession(
  prisma: PrismaClient,
  sessionToken: string
): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { sessionToken },
  })
}

export async function invalidateAllUserSessions(
  prisma: PrismaClient,
  adminId: string
): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { adminId },
  })
}

export async function cleanupExpiredSessions(prisma: PrismaClient): Promise<number> {
  const result = await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
