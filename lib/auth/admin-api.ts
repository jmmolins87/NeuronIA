import "server-only"

import { errorJson } from "@/lib/api/respond"
import { env } from "@/lib/env"

export function requireAdminApiKey(request: Request): Response | null {
  const configured = env.ADMIN_API_KEY
  if (!configured) {
    return errorJson("ADMIN_NOT_CONFIGURED", "ADMIN_API_KEY is not configured", { status: 500 })
  }

  const provided = request.headers.get("x-admin-key")
  if (!provided || provided !== configured) {
    return errorJson("UNAUTHORIZED", "Invalid admin key", { status: 401 })
  }

  return null
}
