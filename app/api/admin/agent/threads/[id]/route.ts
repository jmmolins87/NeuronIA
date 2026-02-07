import "server-only"

import { errorJson, okJson } from "@/lib/api/respond"
import { requireAdminApiKey } from "@/lib/auth/admin-api"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = requireAdminApiKey(request)
  if (auth) return auth

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
