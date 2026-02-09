import "server-only"

import type { NextRequest } from "next/server"

import { errorJson } from "@/lib/api/respond"
import { ADMIN_SECURITY } from "./constants"
import { getCurrentAdmin, type AdminSessionData } from "../admin-auth-v2"
import { validateCsrfToken, extractCsrfToken } from "./csrf"
import { prisma } from "../prisma"

/**
 * Middleware helpers for admin API endpoints
 */

export interface AdminAuthMiddlewareResult {
  session: AdminSessionData
  csrfToken: string
}

/**
 * Require admin session + CSRF token for mutating endpoints
 * 
 * Usage in route handlers:
 * ```ts
 * const auth = await requireAdminWithCsrf(req)
 * if (!auth.ok) return auth.error
 * 
 * const { session, csrfToken } = auth.data
 * // ... proceed with mutation
 * ```
 */
export async function requireAdminWithCsrf(
  request: NextRequest
): Promise<
  | { ok: true; data: AdminAuthMiddlewareResult }
  | { ok: false; error: ReturnType<typeof errorJson> }
> {
  // 1. Get current admin session
  const session = await getCurrentAdmin(request)

  if (!session) {
    return {
      ok: false,
      error: errorJson("UNAUTHORIZED", ADMIN_SECURITY.ERRORS.SESSION_EXPIRED, { status: 401 }),
    }
  }

  // 2. Extract CSRF token from header
  const csrfToken = extractCsrfToken(request)

  if (!csrfToken) {
    return {
      ok: false,
      error: errorJson("CSRF_MISSING", ADMIN_SECURITY.ERRORS.CSRF_INVALID, { status: 403 }),
    }
  }

  // 3. Validate CSRF token against session
  const isValid = await validateCsrfToken(prisma, session.sessionToken, csrfToken)

  if (!isValid) {
    return {
      ok: false,
      error: errorJson("CSRF_INVALID", ADMIN_SECURITY.ERRORS.CSRF_INVALID, { status: 403 }),
    }
  }

  return {
    ok: true,
    data: {
      session,
      csrfToken,
    },
  }
}

/**
 * Require admin session only (no CSRF) for read-only endpoints
 */
export async function requireAdmin(
  request: NextRequest
): Promise<
  | { ok: true; data: { session: AdminSessionData } }
  | { ok: false; error: ReturnType<typeof errorJson> }
> {
  const session = await getCurrentAdmin(request)

  if (!session) {
    return {
      ok: false,
      error: errorJson("UNAUTHORIZED", ADMIN_SECURITY.ERRORS.SESSION_EXPIRED, { status: 401 }),
    }
  }

  return {
    ok: true,
    data: { session },
  }
}

/**
 * Require SUPER_ADMIN role
 */
export async function requireSuperAdmin(
  request: NextRequest
): Promise<
  | { ok: true; data: { session: AdminSessionData } }
  | { ok: false; error: ReturnType<typeof errorJson> }
> {
  const adminResult = await requireAdmin(request)

  if (!adminResult.ok) {
    return adminResult
  }

  const { session } = adminResult.data

  if (session.admin.role !== "SUPER_ADMIN") {
    return {
      ok: false,
      error: errorJson("FORBIDDEN", ADMIN_SECURITY.ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  return {
    ok: true,
    data: { session },
  }
}

/**
 * Require SUPER_ADMIN role + CSRF token
 */
export async function requireSuperAdminWithCsrf(
  request: NextRequest
): Promise<
  | { ok: true; data: AdminAuthMiddlewareResult }
  | { ok: false; error: ReturnType<typeof errorJson> }
> {
  const authResult = await requireAdminWithCsrf(request)

  if (!authResult.ok) {
    return authResult
  }

  const { session } = authResult.data

  if (session.admin.role !== "SUPER_ADMIN") {
    return {
      ok: false,
      error: errorJson("FORBIDDEN", ADMIN_SECURITY.ERRORS.FORBIDDEN, { status: 403 }),
    }
  }

  return authResult
}
