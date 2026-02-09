import { NextRequest } from "next/server"
import { z } from "zod"

import { okJson, errorJson } from "@/lib/api/respond"
import { toResponse } from "@/lib/errors"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { adminLogger } from "@/lib/admin/logger"
import { ADMIN_SECURITY } from "@/lib/admin/constants"
import { createUserAudit } from "@/lib/admin/audit"

export const runtime = "nodejs"

const BootstrapSchema = z.object({
  superadmin: z.object({
    username: z.string().min(1),
    password: z.string().min(8),
    email: z.string().email().optional(),
  }),
  demoUser: z
    .object({
      username: z.string().min(1),
      password: z.string().min(1),
    })
    .optional(),
})

/**
 * Admin Bootstrap Endpoint - V2 Robust
 * 
 * Secure endpoint for automated admin user creation during deployment.
 * 
 * Security:
 * - Requires Authorization: Bearer <ADMIN_BOOTSTRAP_SECRET>
 * - Only active if ADMIN_BOOTSTRAP_ENABLED=true
 * - Should be disabled after initial setup
 * - Creates audit records
 * 
 * Usage:
 * POST /api/admin/bootstrap
 * Authorization: Bearer <ADMIN_BOOTSTRAP_SECRET>
 * Body: { superadmin: { username, password, email? }, demoUser?: { username, password } }
 * 
 * After use: Set ADMIN_BOOTSTRAP_ENABLED=false in production
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check if bootstrap is enabled
    if (!env.ADMIN_BOOTSTRAP_ENABLED) {
      adminLogger.warn("Bootstrap endpoint called but ADMIN_BOOTSTRAP_ENABLED=false")
      return errorJson("FORBIDDEN", "Bootstrap endpoint is disabled", { status: 403 })
    }

    // 2. Verify authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      adminLogger.warn("Bootstrap endpoint called without authorization header")
      return errorJson("UNAUTHORIZED", "Missing authorization header", { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer "
    
    if (!env.ADMIN_BOOTSTRAP_SECRET) {
      adminLogger.error("ADMIN_BOOTSTRAP_SECRET not configured")
      return errorJson("INTERNAL_ERROR", "Bootstrap not properly configured", { status: 500 })
    }

    if (token !== env.ADMIN_BOOTSTRAP_SECRET) {
      adminLogger.warn("Bootstrap endpoint called with invalid token")
      return errorJson("UNAUTHORIZED", "Invalid authorization token", { status: 401 })
    }

    // 3. Parse and validate request body
    const parsed = BootstrapSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid request body", {
        status: 400,
        fields: parsed.error.flatten().fieldErrors as Record<string, string>,
      })
    }

    const { superadmin, demoUser } = parsed.data

    // 4. Hash passwords
    const { default: bcrypt } = await import("bcryptjs")
    const superadminPasswordHash = await bcrypt.hash(superadmin.password, 12)
    const demoPasswordHash = demoUser ? await bcrypt.hash(demoUser.password, 12) : null

    const results: {
      superadmin: { id: string; username: string; created: boolean }
      demoUser?: { id: string; username: string; created: boolean }
    } = {
      superadmin: { id: "", username: "", created: false },
    }

    // 5. Create/update superadmin
    const existingSuperadmin = await prisma.adminUser.findUnique({
      where: { username: superadmin.username },
    })

    if (existingSuperadmin) {
      // Update existing superadmin
      const updated = await prisma.adminUser.update({
        where: { id: existingSuperadmin.id },
        data: {
          passwordHash: superadminPasswordHash,
          email: superadmin.email ?? existingSuperadmin.email,
          role: "SUPER_ADMIN",
          mode: "REAL",
          isActive: true,
        },
      })

      results.superadmin = {
        id: updated.id,
        username: updated.username,
        created: false,
      }

      adminLogger.info("Superadmin updated via bootstrap", {
        adminId: updated.id,
        username: updated.username,
      })
    } else {
      // Create new superadmin
      const created = await prisma.adminUser.create({
        data: {
          username: superadmin.username,
          email: superadmin.email ?? null,
          passwordHash: superadminPasswordHash,
          role: "SUPER_ADMIN",
          mode: "REAL",
          isActive: true,
        },
      })

      results.superadmin = {
        id: created.id,
        username: created.username,
        created: true,
      }

      // Audit: superadmin created
      await createUserAudit(prisma, {
        adminId: created.id,
        targetAdminId: created.id,
        action: ADMIN_SECURITY.AUDIT.USER.CREATE,
        metadata: {
          username: created.username,
          role: "SUPER_ADMIN",
          mode: "REAL",
          source: "bootstrap_endpoint",
        },
      })

      adminLogger.info("Superadmin created via bootstrap", {
        adminId: created.id,
        username: created.username,
      })
    }

    // 6. Create/update demo user (if provided)
    if (demoUser && demoPasswordHash) {
      const existingDemo = await prisma.adminUser.findUnique({
        where: { username: demoUser.username },
      })

      if (existingDemo) {
        const updated = await prisma.adminUser.update({
          where: { id: existingDemo.id },
          data: {
            passwordHash: demoPasswordHash,
            role: "ADMIN",
            mode: "DEMO",
            isActive: true,
          },
        })

        results.demoUser = {
          id: updated.id,
          username: updated.username,
          created: false,
        }

        adminLogger.info("Demo user updated via bootstrap", {
          adminId: updated.id,
          username: updated.username,
        })
      } else {
        const created = await prisma.adminUser.create({
          data: {
            username: demoUser.username,
            passwordHash: demoPasswordHash,
            role: "ADMIN",
            mode: "DEMO",
            isActive: true,
          },
        })

        results.demoUser = {
          id: created.id,
          username: created.username,
          created: true,
        }

        // Audit: demo user created
        await createUserAudit(prisma, {
          adminId: results.superadmin.id, // Created by superadmin
          targetAdminId: created.id,
          action: ADMIN_SECURITY.AUDIT.USER.CREATE,
          metadata: {
            username: created.username,
            role: "ADMIN",
            mode: "DEMO",
            source: "bootstrap_endpoint",
          },
        })

        adminLogger.info("Demo user created via bootstrap", {
          adminId: created.id,
          username: created.username,
        })
      }
    }

    adminLogger.warn("Bootstrap endpoint used - DISABLE ADMIN_BOOTSTRAP_ENABLED NOW", {
      superadminId: results.superadmin.id,
    })

    return okJson({
      message: "Bootstrap completed successfully",
      warning: "IMPORTANT: Set ADMIN_BOOTSTRAP_ENABLED=false in production",
      results,
    })
  } catch (e: unknown) {
    adminLogger.error("Bootstrap endpoint error", {
      error: e instanceof Error ? e.message : String(e),
    })
    return toResponse(e)
  }
}
