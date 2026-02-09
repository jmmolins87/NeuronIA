import { NextRequest } from "next/server"
import { z } from "zod"

import { okJson, errorJson } from "@/lib/api/respond"
import { sendTestEmail } from "@/lib/email/brevo"
import { env } from "@/lib/env"

export const runtime = "nodejs"

const TestEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().optional(),
})

/**
 * Debug endpoint: Send test email
 * 
 * Only available in development mode
 * 
 * POST /api/debug/send-test-email
 * Body: { to: "email@example.com", subject?: "Test Subject" }
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (env.NODE_ENV === "production") {
    return errorJson("FORBIDDEN", "This endpoint is only available in development", {
      status: 403,
    })
  }

  try {
    const parsed = TestEmailSchema.safeParse(await req.json().catch(() => null))
    
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid request body", {
        status: 400,
        fields: parsed.error.flatten().fieldErrors as Record<string, string>,
      })
    }

    const { to, subject } = parsed.data

    const result = await sendTestEmail(to, subject)

    if (!result.ok) {
      return errorJson(
        result.code || "EMAIL_FAILED",
        result.error || "Failed to send test email",
        { status: 500 }
      )
    }

    return okJson({
      message: "Test email sent successfully",
      messageId: result.messageId,
      skipped: result.skipped,
      to,
      subject: subject || "Test Email from ClinvetIA",
    })
  } catch (error: unknown) {
    console.error("[debug] Test email error:", error)
    
    return errorJson(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    )
  }
}
