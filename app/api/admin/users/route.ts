import { NextRequest } from "next/server"
import { z } from "zod"
import { okJson, errorJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

const ListQuery = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  search: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  isActive: z.string().optional().transform(val => val === "true"),
})

const CreateUserBody = z.object({
  username: z.string().min(1),
  email: z.string().email().optional(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
  isActive: z.boolean().optional(),
})

const UpdateUserBody = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req)
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Invalid or expired session", { status: 401 })
    }

    // Only SUPER_ADMIN can list users
    if (session.role !== "SUPER_ADMIN") {
      throw new ApiError("FORBIDDEN", "Only SUPER_ADMIN can list users", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const parsed = ListQuery.safeParse(Object.fromEntries(searchParams))
    
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid query parameters", { status: 400 })
    }

    const { page, limit, search, role, isActive } = parsed.data
    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    }

    const [users, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.adminUser.count({ where }),
    ])

    return okJson({
      users: users.map(user => ({
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (e: unknown) {
    return toResponse(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req)
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Invalid or expired session", { status: 401 })
    }

    // Only SUPER_ADMIN can create users
    if (session.role !== "SUPER_ADMIN") {
      throw new ApiError("FORBIDDEN", "Only SUPER_ADMIN can create users", { status: 403 })
    }

    const parsed = CreateUserBody.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input data", { status: 400 })
    }

    const { username, email, password, role, isActive = true } = parsed.data

    // Check if username already exists
    const existingUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
        ],
      },
    })

    if (existingUser) {
      throw new ApiError("CONFLICT", "Username or email already exists", { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.adminUser.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        isActive,
      },
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