import { NextRequest } from "next/server"

import { okJson } from "@/lib/api/respond"
import { clearAdminSession, getCurrentAdmin } from "@/lib/admin-auth-v2"
import { ADMIN_SECURITY } from "@/lib/admin/constants"
import { createUserAudit } from "@/lib/admin/audit"
import { prisma } from "@/lib/prisma"
import { adminLogger } from "@/lib/admin/logger"

export const runtime = "nodejs"

/**
 * Admin Logout - V2 Robust
 * 
 * - Invalidates session in database
 * - Clears session cookie
 * - Logs audit record
 */
export async function POST(req: NextRequest) {
  try {
    // Get current session for audit
    const session = await getCurrentAdmin(req)

    // Clear session (invalidates in DB + clears cookie)
    await clearAdminSession(req)

    // Audit: logout
    if (session) {
      await createUserAudit(prisma, {
        adminId: session.adminId,
        action: ADMIN_SECURITY.AUDIT.USER.LOGOUT,
        metadata: {
          username: session.admin.username,
        },
      })

      adminLogger.info("Logout successful", {
        adminId: session.adminId,
        username: session.admin.username,
      })
    }

    return okJson({ message: "Logged out successfully" })
  } catch (error: unknown) {
    adminLogger.error("Logout error", {
      error: error instanceof Error ? error.message : String(error),
    })
    // Always return success for logout (even if error)
    return okJson({ message: "Logged out successfully" })
  }
}
