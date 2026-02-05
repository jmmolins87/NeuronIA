import "server-only"

import { z } from "zod"

const optionalNonEmptyString = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).optional()
  )

const optionalUrl = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional()
  )

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: optionalUrl(),
  ADMIN_API_KEY: optionalNonEmptyString(),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1),

  BOOKING_TIMEZONE: z.string().min(1).default("Europe/Madrid"),
  BOOKING_START_TIME: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  BOOKING_END_TIME: z.string().regex(/^\d{2}:\d{2}$/).default("17:30"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().positive().default(30),
  HOLD_TTL_MINUTES: z.coerce.number().int().positive().default(20),
  ALLOW_TIME_OVERRIDE: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
      z
        .enum(["true", "false"])
        .transform((v) => v === "true")
        .default("false")
    ),
})

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((i) => {
      const path = i.path.join(".") || "(root)"
      return `${path}: ${i.message}`
    })
    .join("\n")
}

function resolveDbUrl(primary?: string, fallback?: string): string | undefined {
  return primary?.trim() || fallback?.trim() || undefined
}

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  DATABASE_URL: resolveDbUrl(
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL
  ),
  DATABASE_URL_UNPOOLED: resolveDbUrl(
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING
  ),

  BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE,
  BOOKING_START_TIME: process.env.BOOKING_START_TIME,
  BOOKING_END_TIME: process.env.BOOKING_END_TIME,
  BOOKING_SLOT_MINUTES: process.env.BOOKING_SLOT_MINUTES,
  HOLD_TTL_MINUTES: process.env.HOLD_TTL_MINUTES,
  ALLOW_TIME_OVERRIDE: process.env.ALLOW_TIME_OVERRIDE,
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
