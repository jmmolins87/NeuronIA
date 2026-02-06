import "server-only"

import { z } from "zod"

const TimeHHmmSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Expected HH:mm")
  .refine((value) => {
    const [hh, mm] = value.split(":").map(Number)
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59
  }, "Invalid time")

const BooleanStringSchema = z
  .enum(["true", "false"])
  .transform((v) => v === "true")

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  // Optional but recommended (direct / non-pooled connection URL).
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  // Booking configuration (backend-first reservations)
  BOOKING_TIMEZONE: z.literal("Europe/Madrid").default("Europe/Madrid"),
  BOOKING_START_TIME: TimeHHmmSchema.default("09:00"),
  BOOKING_END_TIME: TimeHHmmSchema.default("17:30"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  HOLD_TTL_MINUTES: z.coerce.number().int().min(1).max(24 * 60).default(20),
  // In dev/test: allow overriding "now" via x-debug-now header.
  // Default: true in non-production, false in production.
  ALLOW_TIME_OVERRIDE: BooleanStringSchema.optional(),
})

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)"
      return `${path}: ${issue.message}`
    })
    .join("\n")
}

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,

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
    "\nRequired:",
    "- APP_URL",
    "- DATABASE_URL",
    "\nBooking (defaults exist, but invalid values will fail):",
    "- BOOKING_TIMEZONE (must be Europe/Madrid)",
    "- BOOKING_START_TIME (HH:mm)",
    "- BOOKING_END_TIME (HH:mm)",
    "- BOOKING_SLOT_MINUTES (int)",
    "- HOLD_TTL_MINUTES (int)",
    "- ALLOW_TIME_OVERRIDE (true|false)",
    "\nOptional (recommended):",
    "- DATABASE_URL_UNPOOLED",
    "\nDetails:",
    formatZodError(parsed.error),
  ].join("\n")

  // Fail fast with a clear message (especially in dev).
  throw new Error(message)
}

export const env = parsed.data
