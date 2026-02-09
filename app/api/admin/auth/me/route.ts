import { NextRequest } from "next/server"

import { okJson, errorJson } from "@/lib/api/respond"
import { getCurrentAdmin } from "@/lib/admin-auth-v2"
import { ADMIN_SECURITY } from "@/lib/admin/constants"

export const runtime = "nodejs"

/**
 * Get Current Admin User + CSRF Token
 * 
 * Returns:
 * - User info (id, username, email, role, mode)
 * - CSRF token for mutations
 * - Session expiry info
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentAdmin(req)

    if (!session) {
      return errorJson(
        "UNAUTHORIZED",
        ADMIN_SECURITY.ERRORS.SESSION_EXPIRED,
        { status: 401 }
      )
    }

    // Calculate time until expiry
    const now = new Date()
    const expiresAt = session.expiresAt
    const expiresInMs = expiresAt.getTime() - now.getTime()
    const expiresInDays = Math.floor(expiresInMs / (24 * 60 * 60 * 1000))

    return okJson({
      user: {
        id: session.admin.id,
        username: session.admin.username,
        email: session.admin.email,
        role: session.admin.role,
        mode: session.admin.mode,
        isActive: session.admin.isActive,
      },
      session: {
        expiresAt: expiresAt.toISOString(),
        expiresInDays,
        lastUsedAt: session.lastUsedAt.toISOString(),
      },
      csrfToken: session.csrfToken,
    })
  } catch (error: unknown) {
    console.error("Get current admin error:", error)
    return errorJson("INTERNAL_ERROR", "Failed to get current user", { status: 500 })
  }
}
