import "server-only"

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { env } from "@/lib/env"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Prisma v7: datasource config lives in prisma.config.ts
// Use PostgreSQL adapter (required for "client" engineType)
const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
