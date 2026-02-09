import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { okJson, errorJson } from "@/lib/api/respond"

export const runtime = "nodejs"

/**
 * Diagnostic endpoint to check admin authentication issues
 * REMOVE THIS IN PRODUCTION
 */
export async function GET(req: NextRequest) {
  try {
    // Check if AdminSession table exists
    let sessionTableExists = false
    let userCount = 0
    let users: Array<{ id: string; username: string; role: string; isActive: boolean; hasPasswordHash: boolean }> = []

    try {
      // Try to count users
      userCount = await prisma.adminUser.count()
      
      // Get basic user info (without password hash)
      users = await prisma.adminUser.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
          passwordHash: true,
        },
        take: 10,
      }).then(u => u.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        hasPasswordHash: !!user.passwordHash && user.passwordHash.length > 0,
      })))

      // Try to check AdminSession table
      await prisma.$queryRaw`SELECT 1 FROM "AdminSession" LIMIT 1`
      sessionTableExists = true
    } catch (e) {
      sessionTableExists = false
    }

    return okJson({
      diagnostic: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        adminUserCount: userCount,
        users: users,
        adminSessionTableExists: sessionTableExists,
      },
      message: userCount === 0 
        ? "No admin users found. Use bootstrap endpoint to create one."
        : `${userCount} admin user(s) found.`,
    })
  } catch (error) {
    console.error("Diagnostic error:", error)
    return errorJson(
      "DIAGNOSTIC_ERROR", 
      error instanceof Error ? error.message : "Unknown error",
      { status: 500 }
    )
  }
}
