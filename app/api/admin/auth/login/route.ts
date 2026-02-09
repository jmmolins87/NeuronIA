import { NextRequest } from "next/server"
import { z } from "zod"

import { okJson, errorJson } from "@/lib/api/respond"
import { toResponse } from "@/lib/errors"
import { authenticateAdmin, setAdminSessionCookie } from "@/lib/admin-auth-v2"

export const runtime = "nodejs"

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

/**
 * Admin Login - V2 Robust
 * 
 * Security Features:
 * - Rate limiting: 5 attempts/10min per IP+username
 * - Account lockout: 10 fails/24h = 30min lock
 * - Neutral error messages (don't reveal user existence)
 * - Session rotation on login
 * - Audit logging
 * - DEMO mode origin restrictions
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = LoginSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Username and password are required", { status: 400 })
    }

    const { username, password } = parsed.data

    // Authenticate user (includes rate limit, lockout, audit)
    const authResult = await authenticateAdmin(username, password, req)

    if (!authResult.success) {
      const status = authResult.code === "RATE_LIMITED" ? 429 : 401
      return errorJson(
        authResult.code || "INVALID_CREDENTIALS",
        authResult.error || "Authentication failed",
        { status }
      )
    }

    if (!authResult.user || !authResult.sessionToken || !authResult.csrfToken) {
      return errorJson("INVALID_CREDENTIALS", "Invalid credentials", { status: 401 })
    }

    // Set session cookie
    await setAdminSessionCookie(authResult.sessionToken)

    return okJson({
      user: {
        id: authResult.user.userId,
        username: authResult.user.username,
        email: authResult.user.email,
        role: authResult.user.role,
        mode: authResult.user.mode,
        isActive: authResult.user.isActive,
      },
      csrfToken: authResult.csrfToken,
    })
  } catch (e: unknown) {
    return toResponse(e)
  }
}
