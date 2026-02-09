import "server-only"

import { randomBytes } from "crypto"
import type { PrismaClient } from "@prisma/client"

import { ADMIN_SECURITY } from "./constants"

/**
 * CSRF Token Management
 */

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url")
}

export async function validateCsrfToken(
  prisma: PrismaClient,
  sessionToken: string,
  csrfToken: string
): Promise<boolean> {
  if (!csrfToken || !sessionToken) {
    return false
  }

  const session = await prisma.adminSession.findUnique({
    where: { sessionToken },
    select: { csrfToken: true, expiresAt: true },
  })

  if (!session) {
    return false
  }

  if (session.expiresAt < new Date()) {
    return false
  }

  return session.csrfToken === csrfToken
}

export function extractCsrfToken(request: Request): string | null {
  return request.headers.get("X-Admin-CSRF")
}

export function requireCsrfToken(request: Request): string {
  const token = extractCsrfToken(request)
  
  if (!token) {
    throw new Error(ADMIN_SECURITY.ERRORS.CSRF_INVALID)
  }

  return token
}
