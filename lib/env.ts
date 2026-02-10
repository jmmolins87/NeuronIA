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

  // Optional notifications
  EMAIL_NOTIFY_ADMIN: BooleanStringSchema.optional(),
  ADMIN_EMAIL: z.string().min(1).optional(),

  // Agent / cron / inbound
  CRON_SECRET: z.string().min(1).optional(),
  ADMIN_API_KEY: z.string().min(1).optional(),
  BREVO_INBOUND_TOKEN: z.string().min(1).optional(),
  INBOUND_EMAIL_DOMAIN: z.string().min(1).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),

  // Booking configuration (backend-first reservations)
  BOOKING_TIMEZONE: z.literal("Europe/Madrid").default("Europe/Madrid"),
  BOOKING_START_TIME: TimeHHmmSchema.default("09:00"),
  BOOKING_END_TIME: TimeHHmmSchema.default("17:30"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  HOLD_TTL_MINUTES: z.coerce.number().int().min(1).max(24 * 60).default(10),

  // Tokens (no-email confirm / cancel / reschedule)
  CANCEL_TOKEN_EXPIRY_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  RESCHEDULE_TOKEN_EXPIRY_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  // In dev/test: allow overriding "now" via x-debug-now header.
  // Default: true in non-production, false in production.
  ALLOW_TIME_OVERRIDE: BooleanStringSchema.optional(),

  // Chat (web assistant)
  OPENAI_API_KEY: z.string().min(1).optional(),
  CHAT_MODEL: z.string().min(1).optional(),
  CHAT_RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).max(600).optional(),
  CHAT_SESSION_SECRET: z.string().min(16).optional(),
  CHAT_AGENT_VERSION: z.enum(["v1", "v2", "v21"]).optional(),

  // Admin System
  ADMIN_SESSION_SECRET: z.string().min(32),
  ADMIN_COOKIE_NAME: z.string().default("clinvetia_admin"),
  ADMIN_DEMO_ENABLED: BooleanStringSchema.default("false"),
  
  // Admin V2: Session & Security
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).optional(),
  ADMIN_DEMO_ALLOWED_ORIGINS: z.string().optional(), // CSV of allowed origins for DEMO login
  
  // Admin V2: Bootstrap endpoint
  ADMIN_BOOTSTRAP_ENABLED: BooleanStringSchema.default("false"),
  ADMIN_BOOTSTRAP_SECRET: z.string().min(32).optional(),
  
  // Super Admin Bootstrap (script)
  ADMIN_BOOTSTRAP_USERNAME: z.string().default("superadmin"),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
})

const EnvSchemaWithRefinements = EnvSchema.superRefine((data, ctx) => {
  if (data.EMAIL_ENABLED && data.EMAIL_PROVIDER !== "brevo") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["EMAIL_PROVIDER"],
      message: "Only brevo is supported",
    })
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

  EMAIL_NOTIFY_ADMIN: process.env.EMAIL_NOTIFY_ADMIN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,

  CRON_SECRET: process.env.CRON_SECRET,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  BREVO_INBOUND_TOKEN: process.env.BREVO_INBOUND_TOKEN,
  INBOUND_EMAIL_DOMAIN: process.env.INBOUND_EMAIL_DOMAIN,
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,

  BOOKING_TIMEZONE: process.env.BOOKING_TIMEZONE,
  BOOKING_START_TIME: process.env.BOOKING_START_TIME,
  BOOKING_END_TIME: process.env.BOOKING_END_TIME,
  BOOKING_SLOT_MINUTES: process.env.BOOKING_SLOT_MINUTES,
  HOLD_TTL_MINUTES: process.env.HOLD_TTL_MINUTES,
  CANCEL_TOKEN_EXPIRY_DAYS: process.env.CANCEL_TOKEN_EXPIRY_DAYS,
  RESCHEDULE_TOKEN_EXPIRY_DAYS: process.env.RESCHEDULE_TOKEN_EXPIRY_DAYS,
  ALLOW_TIME_OVERRIDE: process.env.ALLOW_TIME_OVERRIDE,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CHAT_MODEL: process.env.CHAT_MODEL,
  CHAT_RATE_LIMIT_PER_MIN: process.env.CHAT_RATE_LIMIT_PER_MIN,
  CHAT_SESSION_SECRET: process.env.CHAT_SESSION_SECRET,
  CHAT_AGENT_VERSION: process.env.CHAT_AGENT_VERSION,
  
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  ADMIN_COOKIE_NAME: process.env.ADMIN_COOKIE_NAME,
  ADMIN_DEMO_ENABLED: process.env.ADMIN_DEMO_ENABLED,
  SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
  ADMIN_DEMO_ALLOWED_ORIGINS: process.env.ADMIN_DEMO_ALLOWED_ORIGINS,
  ADMIN_BOOTSTRAP_ENABLED: process.env.ADMIN_BOOTSTRAP_ENABLED,
  ADMIN_BOOTSTRAP_SECRET: process.env.ADMIN_BOOTSTRAP_SECRET,
  ADMIN_BOOTSTRAP_USERNAME: process.env.ADMIN_BOOTSTRAP_USERNAME,
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
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
    "- BREVO_API_KEY",
    "- EMAIL_FROM",
    "- EMAIL_DRY_RUN (true|false)",
    "- EMAIL_NOTIFY_ADMIN (true|false)",
    "- ADMIN_EMAIL",
    "\nBooking (defaults exist, but invalid values will fail):",
    "- BOOKING_TIMEZONE (must be Europe/Madrid)",
    "- BOOKING_START_TIME (HH:mm)",
    "- BOOKING_END_TIME (HH:mm)",
    "- BOOKING_SLOT_MINUTES (int)",
    "- HOLD_TTL_MINUTES (int)",
    "- CANCEL_TOKEN_EXPIRY_DAYS (int)",
    "- RESCHEDULE_TOKEN_EXPIRY_DAYS (int)",
    "- ALLOW_TIME_OVERRIDE (true|false)",
     "\nAdmin System (required):",
     "- ADMIN_SESSION_SECRET (32+ characters)",
     "- ADMIN_BOOTSTRAP_PASSWORD (8+ characters)",
     "\nAdmin System (optional):",
     "- ADMIN_DEMO_ENABLED (true|false)",
     "- ADMIN_BOOTSTRAP_USERNAME",
     "- ADMIN_BOOTSTRAP_EMAIL",
     "- ADMIN_COOKIE_NAME (default: clinvetia_admin)",
     "- SESSION_TTL_DAYS (default: 7, max: 90)",
     "- ADMIN_DEMO_ALLOWED_ORIGINS (CSV of allowed origins)",
     "- ADMIN_BOOTSTRAP_ENABLED (true|false, default: false)",
     "- ADMIN_BOOTSTRAP_SECRET (32+ characters, required if ADMIN_BOOTSTRAP_ENABLED)",
     "\nOptional (recommended):",
     "- DATABASE_URL_UNPOOLED",
    "\nDetails:",
    formatZodError(parsed.error),
  ].join("\n")

  // Fail fast with a clear message (especially in dev).
  throw new Error(message)
}

export const env = parsed.data

// Run environment guardrails after successful env validation
// This prevents local dev from accidentally affecting production
if (typeof window === "undefined") {
  // Only run on server-side (not in browser)
  // Import dynamically to avoid issues with server-only code
  import("./admin/guardrails").then(({ validateEnvironmentOnStartup }) => {
    validateEnvironmentOnStartup()
  }).catch((error) => {
    console.error("Failed to validate environment guardrails:", error)
    // Don't throw here to allow app to start even if guardrails file is missing
    // The guardrails will throw if there's an actual safety issue
  })
}
