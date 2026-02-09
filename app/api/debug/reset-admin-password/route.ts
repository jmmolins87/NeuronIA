import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { okJson, errorJson } from "@/lib/api/respond"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

/**
 * EMERGENCY: Reset admin password
 * 
 * Use this endpoint to reset the admin password when locked out.
 * 
 * POST /api/debug/reset-admin-password
 * Body: { username: "superadmin", newPassword: "newpassword123" }
 * 
 * ⚠️  REMOVE THIS ENDPOINT AFTER USE!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, newPassword } = body

    if (!username || !newPassword) {
      return errorJson("INVALID_INPUT", "username and newPassword required", { status: 400 })
    }

    if (newPassword.length < 8) {
      return errorJson("INVALID_INPUT", "Password must be at least 8 characters", { status: 400 })
    }

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { username },
    })

    if (!user) {
      return errorJson("NOT_FOUND", `User '${username}' not found`, { status: 404 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update user and clear lockout
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedLoginCount: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    })

    // Delete all existing sessions for this user
    await prisma.adminSession.deleteMany({
      where: { adminId: user.id },
    })

    return okJson({
      message: "Password reset successfully",
      username: user.username,
      warning: "⚠️  Remove this endpoint after use!",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return errorJson(
      "RESET_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 }
    )
  }
}

export async function GET() {
  return errorJson(
    "METHOD_NOT_ALLOWED",
    "Use POST to reset password. Body: { username: string, newPassword: string }",
    { status: 405 }
  )
}
