import "server-only"

import { z } from "zod"

const optionalNonEmptyString = () =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(1).optional()
  )

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Required in production. Defaults to localhost in dev/test.
  APP_URL: z.string().url(),
  ADMIN_API_KEY: optionalNonEmptyString(),
  DATABASE_URL: z.string().min(1),
  // Optional: useful for direct (non-pooled) connections for migrations.
  DATABASE_URL_UNPOOLED: optionalNonEmptyString(),

  BOOKING_TIMEZONE: z.string().min(1).default("Europe/Madrid"),
  BOOKING_START_TIME: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  BOOKING_END_TIME: z.string().regex(/^\d{2}:\d{2}$/).default("17:30"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().positive().default(30),
  HOLD_TTL_MINUTES: z.coerce.number().int().positive().default(20),

  CANCEL_TOKEN_EXPIRY_DAYS: z.coerce.number().int().positive().default(30),
  RESCHEDULE_TOKEN_EXPIRY_DAYS: z.coerce.number().int().positive().default(30),

  RESEND_API_KEY: optionalNonEmptyString(),
  EMAIL_FROM: optionalNonEmptyString().default("ClinvetIA <info@clinvetia.com>"),
  ADMIN_EMAIL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().email().optional()
  ),
  EMAIL_ENABLED: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
      z
        .enum(["true", "false"])
        .transform((v) => v === "true")
        .default("true")
    ),
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

function resolveDbUrl(...candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value) return value
  }
  return undefined
}

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL:
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000"),
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  DATABASE_URL: resolveDbUrl(
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL
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

  CANCEL_TOKEN_EXPIRY_DAYS: process.env.CANCEL_TOKEN_EXPIRY_DAYS,
  RESCHEDULE_TOKEN_EXPIRY_DAYS: process.env.RESCHEDULE_TOKEN_EXPIRY_DAYS,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  EMAIL_ENABLED: process.env.EMAIL_ENABLED,
  ALLOW_TIME_OVERRIDE: process.env.ALLOW_TIME_OVERRIDE,
})

if (!parsed.success) {
  const message = [
    "Invalid environment configuration.",
    "\nRequired database env vars:",
    "- DATABASE_URL (preferred) OR POSTGRES_PRISMA_URL / POSTGRES_URL (fallback)",
    "\nOptional database env vars (recommended for migrations):",
    "- DATABASE_URL_UNPOOLED (preferred) OR POSTGRES_URL_NON_POOLING (fallback)",
    "\nDetails:",
    formatZodError(parsed.error),
  ].join("\n")

  throw new Error(message)
}

export const env = parsed.data
