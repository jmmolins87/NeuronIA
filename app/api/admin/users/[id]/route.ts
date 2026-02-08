import { NextRequest } from "next/server"
import { z } from "zod"
import { okJson, errorJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"
import { verifyAdminSession } from "@/lib/admin-auth"
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(req)
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Invalid or expired session", { status: 401 })
    }

    // Only SUPER_ADMIN can get user details
    if (session.role !== "SUPER_ADMIN") {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(req)
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Invalid or expired session", { status: 401 })
    }

    // Only SUPER_ADMIN can update users
    if (session.role !== "SUPER_ADMIN") {
      throw new ApiError("FORBIDDEN", "Only SUPER_ADMIN can update users", { status: 403 })
    }

    const parsed = UpdateUserBody.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input data", { status: 400 })
    }

    const updateData = parsed.data
    const { password, ...otherData } = updateData

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      throw new ApiError("NOT_FOUND", "User not found", { status: 404 })
    }

    // Prevent self-deactivation
    if (params.id === session.userId && otherData.isActive === false) {
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

    const updatedUser = await prisma.adminUser.update({
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminSession(req)
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Invalid or expired session", { status: 401 })
    }

    // Only SUPER_ADMIN can delete users
    if (session.role !== "SUPER_ADMIN") {
      throw new ApiError("FORBIDDEN", "Only SUPER_ADMIN can delete users", { status: 403 })
    }

    // Prevent self-deletion
    if (params.id === session.userId) {
      throw new ApiError("INVALID_INPUT", "Cannot delete your own account", { status: 400 })
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      throw new ApiError("NOT_FOUND", "User not found", { status: 404 })
    }

    await prisma.adminUser.delete({
      where: { id: params.id },
    })

    return okJson({ message: "User deleted successfully" })

  } catch (e: unknown) {
    return toResponse(e)
  }
}