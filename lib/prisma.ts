import "server-only"

import { PrismaClient } from "@prisma/client"

import { env } from "@/lib/env"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  })

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

// Lazy Prisma client: prevents build-time failures when env is not present.
// The real PrismaClient is created the first time a property is accessed.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined
    const client = getPrismaClient() as unknown as Record<PropertyKey, unknown>
    const value = client[prop]
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client)
    }
    return value
  },
})
