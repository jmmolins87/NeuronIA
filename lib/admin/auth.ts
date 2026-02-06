import "server-only"

import type { NextRequest } from "next/server"

import { env } from "@/lib/env"
import { ApiError } from "@/lib/api/errors"

export function requireAdmin(req: NextRequest): void {
  const provided = req.headers.get("x-admin-key")
  const expected = env.ADMIN_API_KEY

  if (!expected || !provided || provided !== expected) {
    throw new ApiError("UNAUTHORIZED", "Unauthorized", { status: 401 })
  }
}
