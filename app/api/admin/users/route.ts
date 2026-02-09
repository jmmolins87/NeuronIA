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

/**
 * List Users - SUPER_ADMIN Only (no CSRF required for GET)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Validate admin session + require SUPER_ADMIN role
    const auth = await requireAdmin(req)
    if (!auth.ok) return auth.error
    
    const { session } = auth.data

    // Only SUPER_ADMIN can list users
    if (session.admin.role !== "SUPER_ADMIN") {
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

/**
 * Create User - SUPER_ADMIN Only with CSRF Protection
 * 
 * Security:
 * - Requires valid admin session with SUPER_ADMIN role
 * - Requires CSRF token in X-Admin-CSRF header
 * - Creates audit log entry
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validate SUPER_ADMIN session + CSRF
    const auth = await requireSuperAdminWithCsrf(req)
    if (!auth.ok) return auth.error

    const { session } = auth.data
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || undefined

    // 2. Validate input
    const parsed = CreateUserBody.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input data", { status: 400 })
    }

    const { username, email, password, role, isActive = true } = parsed.data

    // 3. Check if username/email already exists
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

    // 4. Create user with audit log
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.adminUser.create({
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

      // Create audit record
      await createUserAudit(tx, {
        adminId: session.adminId,
        targetAdminId: newUser.id,
        action: ADMIN_SECURITY.AUDIT.USER.CREATE,
        metadata: {
          username: newUser.username,
          email: newUser.email ?? undefined,
          role: newUser.role,
          ip,
          userAgent,
        },
      })

      return newUser
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