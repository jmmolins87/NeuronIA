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

  // Transactional email (Brevo)
  EMAIL_ENABLED: BooleanStringSchema.default("false"),
  EMAIL_PROVIDER: z.enum(["brevo"]).default("brevo"),
  BREVO_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  // In dev/test: build payload and skip sending.
  EMAIL_DRY_RUN: BooleanStringSchema.optional(),

  // Booking configuration (backend-first reservations)
  BOOKING_TIMEZONE: z.literal("Europe/Madrid").default("Europe/Madrid"),
  BOOKING_START_TIME: TimeHHmmSchema.default("09:00"),
  BOOKING_END_TIME: TimeHHmmSchema.default("17:30"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  HOLD_TTL_MINUTES: z.coerce.number().int().min(1).max(24 * 60).default(20),

  // Tokens (no-email confirm / cancel / reschedule)
  CANCEL_TOKEN_EXPIRY_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  RESCHEDULE_TOKEN_EXPIRY_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  // In dev/test: allow overriding "now" via x-debug-now header.
  // Default: true in non-production, false in production.
  ALLOW_TIME_OVERRIDE: BooleanStringSchema.optional(),
})

const EnvSchemaWithRefinements = EnvSchema.superRefine((data, ctx) => {
  if (data.EMAIL_ENABLED) {
    if (data.EMAIL_PROVIDER !== "brevo") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["EMAIL_PROVIDER"],
        message: "Only brevo is supported",
      })
    }
    if (!data.BREVO_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["BREVO_API_KEY"],
        message: "Required when EMAIL_ENABLED=true",
      })
    }
    if (!data.EMAIL_FROM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["EMAIL_FROM"],
        message: "Required when EMAIL_ENABLED=true",
      })
    }
  }
})

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "(root)"
      return `${path}: ${issue.message}`
    })
    .join("\n")
}

const parsed = EnvSchemaWithRefinements.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,

  EMAIL_ENABLED: process.env.EMAIL_ENABLED,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_DRY_RUN: process.env.EMAIL_DRY_RUN,

  BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE,
  BOOKING_START_TIME: process.env.BOOKING_START_TIME,
  BOOKING_END_TIME: process.env.BOOKING_END_TIME,
  BOOKING_SLOT_MINUTES: process.env.BOOKING_SLOT_MINUTES,
  HOLD_TTL_MINUTES: process.env.HOLD_TTL_MINUTES,
  CANCEL_TOKEN_EXPIRY_DAYS: process.env.CANCEL_TOKEN_EXPIRY_DAYS,
  RESCHEDULE_TOKEN_EXPIRY_DAYS: process.env.RESCHEDULE_TOKEN_EXPIRY_DAYS,
  ALLOW_TIME_OVERRIDE: process.env.ALLOW_TIME_OVERRIDE,
})

if (!parsed.success) {
  const message = [
    "Invalid environment configuration.",
    "\nRequired:",
    "- APP_URL",
    "- DATABASE_URL",
    "\nEmail (optional; required only if enabled):",
    "- EMAIL_ENABLED (true|false)",
    "- EMAIL_PROVIDER (brevo)",
    "- BREVO_API_KEY (required if EMAIL_ENABLED=true)",
    "- EMAIL_FROM (required if EMAIL_ENABLED=true)",
    "- EMAIL_DRY_RUN (true|false)",
    "\nBooking (defaults exist, but invalid values will fail):",
    "- BOOKING_TIMEZONE (must be Europe/Madrid)",
    "- BOOKING_START_TIME (HH:mm)",
    "- BOOKING_END_TIME (HH:mm)",
    "- BOOKING_SLOT_MINUTES (int)",
    "- HOLD_TTL_MINUTES (int)",
    "- CANCEL_TOKEN_EXPIRY_DAYS (int)",
    "- RESCHEDULE_TOKEN_EXPIRY_DAYS (int)",
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
