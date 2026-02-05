import "server-only"

import { z } from "zod"

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().optional(),
  ADMIN_API_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1),
})

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((i) => {
      const path = i.path.join(".") || "(root)"
      return `${path}: ${i.message}`
    })
    .join("\n")
}

function resolveDbUrl(name: string, primary?: string, fallback?: string): string | undefined {
  return primary?.trim() || fallback?.trim() || undefined
}

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  DATABASE_URL: resolveDbUrl(
    "DATABASE_URL",
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL
  ),
  DATABASE_URL_UNPOOLED: resolveDbUrl(
    "DATABASE_URL_UNPOOLED",
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING
  ),
})

if (!parsed.success) {
  const message = [
    "Invalid environment configuration.",
    "\nRequired database env vars (Neon/Vercel Marketplace):",
    "- DATABASE_URL (preferred; pooled) OR POSTGRES_PRISMA_URL (fallback)",
    "- DATABASE_URL_UNPOOLED (preferred; direct) OR POSTGRES_URL_NON_POOLING (fallback)",
    "\nDetails:",
    formatZodError(parsed.error),
  ].join("\n")

  throw new Error(message)
}

export const env = parsed.data
