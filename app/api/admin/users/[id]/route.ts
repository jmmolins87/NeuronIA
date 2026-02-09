import { NextRequest } from "next/server"
import { z } from "zod"
import { okJson, errorJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"
import { requireAdmin, requireSuperAdminWithCsrf } from "@/lib/admin/middleware"
import { createUserAudit } from "@/lib/admin/audit"
import { ADMIN_SECURITY } from "@/lib/admin/constants"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

const UpdateUserBody = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
})

const ResetPasswordBody = z.object({
  newPassword: z.string().min(8),
})

/**
 * Get User Details - SUPER_ADMIN Only (no CSRF required for GET)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin(req)
    if (!auth.ok) return auth.error
    
    const { session } = auth.data

    // Only SUPER_ADMIN can get user details
    if (session.admin.role !== "SUPER_ADMIN") {
      throw new ApiError("FORBIDDEN", "Only SUPER_ADMIN can view user details", { status: 403 })
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't include passwordHash
      },
    })

    if (!user) {
      throw new ApiError("NOT_FOUND", "User not found", { status: 404 })
    }

    return okJson({
      user: {
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })

  } catch (e: unknown) {
    return toResponse(e)
  }
}

/**
 * Update User - SUPER_ADMIN Only with CSRF Protection
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate SUPER_ADMIN session + CSRF
    const auth = await requireSuperAdminWithCsrf(req)
    if (!auth.ok) return auth.error

    const { session } = auth.data
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || undefined

    // 2. Validate input
    const parsed = UpdateUserBody.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input data", { status: 400 })
    }

    const updateData = parsed.data
    const { password, ...otherData } = updateData

    // 3. Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      throw new ApiError("NOT_FOUND", "User not found", { status: 404 })
    }

    // Prevent self-deactivation
    if (params.id === session.adminId && otherData.isActive === false) {
      throw new ApiError("INVALID_INPUT", "Cannot deactivate your own account", { status: 400 })
    }

    // Check for username/email conflicts
    if (otherData.username || otherData.email) {
      const conflictUser = await prisma.adminUser.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(otherData.username ? [{ username: otherData.username }] : []),
                ...(otherData.email ? [{ email: otherData.email }] : []),
              ],
            },
          ],
        },
      })

      if (conflictUser) {
        throw new ApiError("CONFLICT", "Username or email already exists", { status: 409 })
      }
    }

    // Prepare update data
    const finalUpdateData: Record<string, unknown> = { ...otherData }
    
    if (password) {
      finalUpdateData.passwordHash = await bcrypt.hash(password, 12)
    }

    if (Object.keys(finalUpdateData).length === 0) {
      throw new ApiError("INVALID_INPUT", "No valid fields to update", { status: 400 })
    }

    // 4. Update user with audit log
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.adminUser.update({
        where: { id: params.id },
        data: finalUpdateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      // Create audit record
      await createUserAudit(tx, {
        adminId: session.adminId,
        targetAdminId: user.id,
        action: ADMIN_SECURITY.AUDIT.USER.UPDATE,
        metadata: {
          changes: Object.keys(otherData),
          changedPassword: !!password,
          ip,
          userAgent,
        },
      })

      return user
    })

    return okJson({
      user: {
        ...updatedUser,
        lastLoginAt: updatedUser.lastLoginAt?.toISOString() || null,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    })

  } catch (e: unknown) {
    return toResponse(e)
  }
}

/**
 * Delete User - SUPER_ADMIN Only with CSRF Protection
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate SUPER_ADMIN session + CSRF
    const auth = await requireSuperAdminWithCsrf(req)
    if (!auth.ok) return auth.error

    const { session } = auth.data
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || undefined

    // Prevent self-deletion
    if (params.id === session.adminId) {
      throw new ApiError("INVALID_INPUT", "Cannot delete your own account", { status: 400 })
    }

    // 2. Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      throw new ApiError("NOT_FOUND", "User not found", { status: 404 })
    }

    // 3. Delete user with audit log
    await prisma.$transaction(async (tx) => {
      // Create audit record before deletion
      await createUserAudit(tx, {
        adminId: session.adminId,
        targetAdminId: params.id,
        action: ADMIN_SECURITY.AUDIT.USER.DELETE,
        metadata: {
          deletedUsername: existingUser.username,
          deletedEmail: existingUser.email,
          deletedRole: existingUser.role,
          ip,
          userAgent,
        },
      })

      await tx.adminUser.delete({
        where: { id: params.id },
      })
    })

    return okJson({ message: "User deleted successfully" })

  } catch (e: unknown) {
    return toResponse(e)
  }
}