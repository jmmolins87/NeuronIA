import "server-only"

import { z } from "zod"

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  // Optional but recommended (direct / non-pooled connection URL).
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
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
})

if (!parsed.success) {
  const message = [
    "Invalid environment configuration.",
    "\nRequired:",
    "- APP_URL",
    "- DATABASE_URL",
    "\nOptional (recommended):",
    "- DATABASE_URL_UNPOOLED",
    "\nDetails:",
    formatZodError(parsed.error),
  ].join("\n")

  // Fail fast with a clear message (especially in dev).
  throw new Error(message)
}

export const env = parsed.data
