import { NextRequest } from "next/server"
import { z } from "zod"
import { okJson, errorJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"
import { authenticateAdmin, createAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = LoginSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Username and password are required", { status: 400 })
    }

    const { username, password } = parsed.data

    // Authenticate user
    const authResult = await authenticateAdmin(username, password)
    
    if (!authResult.success) {
      return errorJson("INVALID_CREDENTIALS", authResult.error || "Authentication failed", { status: 401 })
    }

    if (!authResult.user) {
      return errorJson("INVALID_CREDENTIALS", "Invalid credentials", { status: 401 })
    }

    // Create session cookie
    await createAdminSession(authResult.user)

    return okJson({
      user: {
        id: authResult.user.userId,
        username: authResult.user.username,
        role: authResult.user.role,
        isActive: authResult.user.isActive,
      },
    })

  } catch (e: unknown) {
    return toResponse(e)
  }
}