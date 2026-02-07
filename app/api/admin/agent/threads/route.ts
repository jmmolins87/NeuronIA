import "server-only"

import { okJson } from "@/lib/api/respond"
import { requireAdminApiKey } from "@/lib/auth/admin-api"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const auth = requireAdminApiKey(request)
  if (auth) return auth

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
