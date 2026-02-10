import { NextRequest } from "next/server"
import { z } from "zod"

import { okJson, errorJson } from "@/lib/api/respond"
import { toResponse } from "@/lib/errors"
import { verifyAdminSession } from "@/lib/admin-auth-v2"
import { canAccessDemoFeatures } from "@/lib/admin/enforcement"

export const runtime = "nodejs"

const RegenerateSchema = z.object({
  seed: z.string().optional(),
})

/**
 * POST /api/admin/demo/regenerate
 * 
 * Regenerates DEMO data with a new seed.
 * Only accessible by users in DEMO mode.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify session
    const session = await verifyAdminSession(req)
    
    if (!session) {
      return errorJson("UNAUTHORIZED", "Not authenticated", { status: 401 })
    }

    // Check if user can access DEMO features
    if (!canAccessDemoFeatures(session.admin)) {
      return errorJson(
        "FORBIDDEN",
        "This feature is only available in DEMO mode",
        { status: 403 }
      )
    }

    // Parse request body
    const parsed = RegenerateSchema.safeParse(await req.json().catch(() => ({})))
    
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid request body", { status: 400 })
    }

    const { seed } = parsed.data

    // Generate new seed if not provided
    const newSeed = seed || `demo-${Date.now()}`

    // Note: The actual regeneration happens on the client side
    // This endpoint just validates the request and returns the seed
    // The client will use this seed to regenerate data locally

    return okJson({
      seed: newSeed,
      message: "Use this seed to regenerate demo data on the client"
    })
  } catch (e: unknown) {
    return toResponse(e)
  }
}
