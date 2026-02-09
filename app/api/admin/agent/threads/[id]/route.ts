import "server-only"

import { NextRequest } from "next/server"
import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdmin } from "@/lib/admin/middleware"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * Get Thread Details - Admin Only (no CSRF required for GET)
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.error

  const { id } = await context.params
  if (!id) return errorJson("INVALID_INPUT", "Missing id", { status: 400 })

  const thread = await prisma.agentThread.findUnique({
    where: { id },
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
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          direction: true,
          text: true,
          raw: true,
          createdAt: true,
        },
      },
    },
  })

  if (!thread) return errorJson("NOT_FOUND", "Thread not found", { status: 404 })

  return okJson({ thread })
}
