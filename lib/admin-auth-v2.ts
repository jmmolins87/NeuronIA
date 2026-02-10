import "server-only"

import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { AdminRole, AdminMode } from "@prisma/client"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { ADMIN_SECURITY } from "./admin/constants"
import { adminLogger } from "./admin/logger"
import { checkRateLimit, recordLoginAttempt, resetRateLimit } from "./admin/rate-limit"
import {
  createSession,
  getSessionByToken,
  invalidateSession,
  renewSession,
  type AdminSessionData,
} from "./admin/session-manager"
import { createUserAudit } from "./admin/audit"
import { enforceSuperAdminMode } from "./admin/enforcement"

/**
 * Admin V2 Authentication - Robust Security
 * 
 * Features:
 * - Database-backed sessions (no JWT in cookies)
 * - Rate limiting (5 attempts/10min per IP+username)
 * - Account lockout (10 fails/24h = 30min lock)
 * - Neutral error messages
 * - Sliding sessions (auto-renew if <24h remaining)
 * - DEMO mode with origin restrictions
 * - Audit logging
 */

// Types
export interface AdminSession {
  userId: string
  username: string
  email: string | null
  role: AdminRole
  mode: AdminMode
  isActive: boolean
}

export interface AdminAuthResult {
  success: boolean
  user?: AdminSession
  sessionToken?: string
  csrfToken?: string
  error?: string
  code?: string
}

// Cookie configuration
function getCookieOptions() {
  return {
    name: ADMIN_SECURITY.SESSION.COOKIE_NAME,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year (actual expiry controlled by DB)
  }
}

// Helper: Extract IP from request
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }
  
  // Fallback to unknown if no IP headers found
  return "unknown"
}

// Helper: Check if account is locked
function isAccountLocked(user: {
  failedLoginCount: number
  lastFailedLoginAt: Date | null
  lockedUntil: Date | null
}): boolean {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true
  }
  return false
}

// Helper: Check if DEMO login is allowed from origin
function isDemoLoginAllowed(request: NextRequest): boolean {
  const allowedOriginsEnv = env.ADMIN_DEMO_ALLOWED_ORIGINS
  
  if (!allowedOriginsEnv) {
    // No restrictions if not configured
    return true
  }

  const origin = request.headers.get("origin") || request.headers.get("referer")
  
  if (!origin) {
    return false
  }

  const allowedOrigins = allowedOriginsEnv.split(",").map((o) => o.trim().toLowerCase())
  const originLower = origin.toLowerCase()

  return allowedOrigins.some((allowed) => {
    return originLower.startsWith(allowed) || originLower.includes(allowed)
  })
}

/**
 * Authenticate admin user with enhanced security
 */
export async function authenticateAdmin(
  username: string,
  password: string,
  request: NextRequest
): Promise<AdminAuthResult> {
  const ip = getClientIp(request)
  const userAgent = request.headers.get("user-agent") ?? undefined

  try {
    // 1. Rate limit check
    const rateLimitCheck = checkRateLimit(ip, username)
    
    if (!rateLimitCheck.allowed) {
      adminLogger.warn("Login rate limited", {
        username,
        ip,
        remainingAttempts: rateLimitCheck.remainingAttempts,
      })

      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.RATE_LIMITED,
        code: "RATE_LIMITED",
      }
    }

    // 2. Find user
    const admin = await prisma.adminUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        mode: true,
        isActive: true,
        failedLoginCount: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
      },
    })

    // 3. Check user exists (neutral message)
    if (!admin) {
      recordLoginAttempt(ip, username)
      
      adminLogger.warn("Login failed: user not found", { username, ip })

      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.INVALID_CREDENTIALS,
        code: "INVALID_CREDENTIALS",
      }
    }

    // 4. Check account locked
    if (isAccountLocked(admin)) {
      adminLogger.warn("Login failed: account locked", {
        username: admin.username,
        ip,
        lockedUntil: admin.lockedUntil,
      })

      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.ACCOUNT_LOCKED,
        code: "ACCOUNT_LOCKED",
      }
    }

    // 5. Check active
    if (!admin.isActive) {
      recordLoginAttempt(ip, username)
      
      adminLogger.warn("Login failed: account inactive", { username: admin.username, ip })

      // Neutral message (don't reveal account exists but is disabled)
      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.INVALID_CREDENTIALS,
        code: "INVALID_CREDENTIALS",
      }
    }

    // 6. DEMO mode: check allowed origins
    if (admin.mode === "DEMO" && !isDemoLoginAllowed(request)) {
      recordLoginAttempt(ip, username)

      adminLogger.warn("Demo login blocked: origin not allowed", {
        username: admin.username,
        ip,
        origin: request.headers.get("origin"),
      })

      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.INVALID_CREDENTIALS,
        code: "INVALID_CREDENTIALS",
      }
    }

    // 7. Verify password
    const { default: bcrypt } = await import("bcryptjs")
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      recordLoginAttempt(ip, username)

      // Update failed login count
      const newFailedCount = admin.failedLoginCount + 1
      const now = new Date()
      
      // Check if we need to lock the account
      let lockedUntil: Date | null = null
      
      if (newFailedCount >= ADMIN_SECURITY.LOCKOUT.MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(now.getTime() + ADMIN_SECURITY.LOCKOUT.LOCKOUT_DURATION_MS)
        
        adminLogger.warn("Account locked due to failed attempts", {
          username: admin.username,
          failedCount: newFailedCount,
          lockedUntil,
        })
      }

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginCount: newFailedCount,
          lastFailedLoginAt: now,
          lockedUntil,
        },
      })

      // Audit: failed login
      await createUserAudit(prisma, {
        adminId: admin.id,
        action: ADMIN_SECURITY.AUDIT.USER.LOGIN_FAILED,
        metadata: {
          ip,
          userAgent,
          reason: "Invalid password",
        },
      })

      adminLogger.warn("Login failed: invalid password", {
        username: admin.username,
        ip,
        failedCount: newFailedCount,
      })

      return {
        success: false,
        error: ADMIN_SECURITY.ERRORS.INVALID_CREDENTIALS,
        code: "INVALID_CREDENTIALS",
      }
    }

    // 8. Success! Enforce mode constraints (SUPER_ADMIN must be REAL)
    const enforcementResult = await enforceSuperAdminMode({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      mode: admin.mode
    })

    // Update mode if it was corrected
    const finalMode = enforcementResult.corrected ? "REAL" : admin.mode

    // 9. Reset failed login count and update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginCount: 0,
        lastFailedLoginAt: null,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    })

    // Reset rate limit on success
    resetRateLimit(ip, username)

    // Create session in DB
    const session = await createSession(prisma, {
      ...admin,
      mode: finalMode // Use enforced mode
    }, { ipAddress: ip, userAgent })

    // Audit: successful login
    const auditAction =
      finalMode === "DEMO"
        ? ADMIN_SECURITY.AUDIT.USER.DEMO_LOGIN
        : ADMIN_SECURITY.AUDIT.USER.LOGIN_SUCCESS

    await createUserAudit(prisma, {
      adminId: admin.id,
      action: auditAction,
      metadata: {
        ip,
        userAgent,
        mode: finalMode,
        modeEnforced: enforcementResult.corrected,
      },
    })

    adminLogger.info("Login successful", {
      username: admin.username,
      role: admin.role,
      mode: finalMode,
      ip,
      enforcementApplied: enforcementResult.corrected,
    })

    const adminSession: AdminSession = {
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      mode: finalMode, // Use enforced mode
      isActive: admin.isActive,
    }

    return {
      success: true,
      user: adminSession,
      sessionToken: session.sessionToken,
      csrfToken: session.csrfToken,
    }
  } catch (error) {
    adminLogger.error("Authentication error", {
      username,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      success: false,
      error: "Authentication failed",
      code: "INTERNAL_ERROR",
    }
  }
}

/**
 * Get current admin from session token (with sliding session renewal)
 */
export async function getCurrentAdmin(request?: NextRequest): Promise<AdminSessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = request
      ? request.cookies.get(ADMIN_SECURITY.SESSION.COOKIE_NAME)?.value
      : cookieStore.get(ADMIN_SECURITY.SESSION.COOKIE_NAME)?.value

    if (!sessionToken) {
      return null
    }

    // Renew session if needed (sliding session)
    const session = await renewSession(prisma, sessionToken)

    return session
  } catch (error) {
    adminLogger.error("Get current admin error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Verify admin session for API routes
 */
export async function verifyAdminSession(request: NextRequest): Promise<AdminSessionData | null> {
  return getCurrentAdmin(request)
}

/**
 * Create admin session cookie
 */
export async function setAdminSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SECURITY.SESSION.COOKIE_NAME, sessionToken, getCookieOptions())
}

/**
 * Clear admin session (logout)
 */
export async function clearAdminSession(request?: NextRequest): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = request
    ? request.cookies.get(ADMIN_SECURITY.SESSION.COOKIE_NAME)?.value
    : cookieStore.get(ADMIN_SECURITY.SESSION.COOKIE_NAME)?.value

  if (sessionToken) {
    // Invalidate session in DB
    await invalidateSession(prisma, sessionToken)
  }

  cookieStore.delete(ADMIN_SECURITY.SESSION.COOKIE_NAME)
}

/**
 * Middleware helper (redirects to login if no session)
 */
export function adminAuthMiddleware(request: NextRequest) {
  const session = getCurrentAdmin(request)

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return null
}

/**
 * Role-based access control
 */
export function canAccessUsers(role: AdminRole): boolean {
  return role === "SUPER_ADMIN"
}

export function canAccessAllBookings(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN"
}

export function requireSuperAdmin(session: AdminSessionData | null): boolean {
  return session?.admin.role === "SUPER_ADMIN"
}

export function requireAdmin(session: AdminSessionData | null): boolean {
  return Boolean(
    session && (session.admin.role === "SUPER_ADMIN" || session.admin.role === "ADMIN")
  )
}
