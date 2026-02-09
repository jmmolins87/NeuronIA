import "server-only"

import { NextRequest } from "next/server"
import { okJson } from "@/lib/api/respond"
import { requireAdmin } from "@/lib/admin/middleware"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * List Threads - Admin Only (no CSRF required for GET)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.error

  const url = new URL(request.url)
  const takeParam = url.searchParams.get("take")
  const take = takeParam ? Number(takeParam) : 50

  const threads = await prisma.agentThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: Number.isFinite(take) ? Math.max(1, Math.min(200, take)) : 50,
    select: {
      id: true,
      channel: true,
      externalId: true,
      locale: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      status: true,
      lastMessageAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return okJson({ threads })
}
