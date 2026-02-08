import { NextRequest } from "next/server"
import { okJson } from "@/lib/api/respond"
import { clearAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Clear session cookie
    await clearAdminSession()

    return okJson({ message: "Logged out successfully" })

  } catch (error: unknown) {
    console.error("Logout error:", error)
    return okJson({ message: "Logged out successfully" })
  }
}