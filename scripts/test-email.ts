#!/usr/bin/env tsx

/**
 * CLI script to test email sending
 * 
 * Usage:
 *   npm run test:email -- your@email.com
 *   npm run test:email -- your@email.com "Custom Subject"
 * 
 * Or directly with tsx:
 *   npx tsx scripts/test-email.ts your@email.com
 * 
 * Note: This script directly uses environment variables to avoid server-only restrictions.
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load env vars from .env.local (Next.js convention)
config({ path: resolve(process.cwd(), ".env.local") })

interface BrevoAttachment {
  name: string
  content: string // base64
}

interface SendTransacEmailArgs {
  from: { name?: string; email: string }
  to: Array<{ name?: string; email: string }>
  replyTo?: { name?: string; email: string }
  subject: string
  html: string
  text: string
  attachments?: BrevoAttachment[]
  tags?: string[]
  headers?: Record<string, string>
  timeoutMs?: number
  maxRetries?: number
}

interface SendEmailResult {
  ok: boolean
  messageId?: string
  skipped?: boolean
  error?: string
  code?: string
}

/**
 * Helper: Parse EMAIL_FROM env var to extract name and email
 */
function parseEmailFrom(emailFrom: string): { name?: string; email: string } {
  const match = emailFrom.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/)
  
  if (!match) {
    return { email: emailFrom.trim() }
  }

  const [, name, email] = match
  return {
    email: email.trim(),
    name: name?.trim() || undefined,
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Send transactional email (standalone version for CLI)
 */
async function sendTransacEmail(args: SendTransacEmailArgs): Promise<SendEmailResult> {
  const recipientEmail = args.to[0]?.email || "unknown"
  const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true"
  const BREVO_API_KEY = process.env.BREVO_API_KEY
  
  // 1. Check if email is enabled
  if (!EMAIL_ENABLED) {
    console.log(`[EMAIL] Email sending skipped (EMAIL_ENABLED=false)`)
    return {
      ok: true,
      skipped: true,
      code: "EMAIL_DISABLED",
    }
  }

  // 2. Validate BREVO_API_KEY
  if (!BREVO_API_KEY) {
    console.error(`[EMAIL] BREVO_API_KEY not configured`)
    return {
      ok: false,
      error: "BREVO_API_KEY not configured",
      code: "UPSTREAM_MISCONFIG",
    }
  }

  const maxRetries = args.maxRetries ?? 3
  const timeoutMs = args.timeoutMs ?? 12_000
  const retryDelayMs = 1000

  // 3. Build payload
  const payload: Record<string, unknown> = {
    sender: {
      email: args.from.email,
      ...(args.from.name ? { name: args.from.name } : {}),
    },
    to: args.to.map((r) => ({ email: r.email, ...(r.name ? { name: r.name } : {}) })),
    subject: args.subject,
    htmlContent: args.html,
    textContent: args.text,
  }

  if (args.replyTo) {
    payload.replyTo = {
      email: args.replyTo.email,
      ...(args.replyTo.name ? { name: args.replyTo.name } : {}),
    }
  }

  if (args.attachments && args.attachments.length > 0) {
    payload.attachment = args.attachments.map((a) => ({ name: a.name, content: a.content }))
  }

  if (args.tags && args.tags.length > 0) {
    payload.tags = args.tags
  }

  if (args.headers && Object.keys(args.headers).length > 0) {
    payload.headers = args.headers
  }

  // 4. Send with retry logic
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      console.log(`[EMAIL] Sending email via Brevo (attempt ${attempt})`)

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      const text = await res.text()
      let body: unknown = null
      if (text) {
        try {
          body = JSON.parse(text) as unknown
        } catch {
          body = text
        }
      }

      if (!res.ok) {
        const errorMessage = body && typeof body === "object" && "message" in body
          ? String((body as { message: unknown }).message)
          : typeof body === "string"
          ? body.substring(0, 200)
          : "Brevo API error"

        const errorCode = body && typeof body === "object" && "code" in body
          ? String((body as { code: unknown }).code)
          : `HTTP_${res.status}`

        console.error(`[EMAIL] Brevo API error: ${errorMessage} (${errorCode})`)

        // Retry on 5xx errors
        if (res.status >= 500 && attempt < maxRetries) {
          await delay(retryDelayMs * attempt)
          clearTimeout(timeout)
          continue
        }

        clearTimeout(timeout)

        return {
          ok: false,
          error: errorMessage,
          code: errorCode,
        }
      }

      // Success
      const messageId = body && typeof body === "object" && body !== null && "messageId" in body
        ? String((body as { messageId: unknown }).messageId)
        : undefined

      console.log(`[EMAIL] Email sent successfully (messageId: ${messageId})`)

      clearTimeout(timeout)

      return {
        ok: true,
        messageId,
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (error instanceof Error && error.name === "AbortError") {
        console.error(`[EMAIL] Email request timed out (${timeoutMs}ms)`)
      } else {
        console.error(`[EMAIL] Network error: ${lastError.message}`)
      }

      clearTimeout(timeout)

      // Retry on network errors
      if (attempt < maxRetries) {
        await delay(retryDelayMs * attempt)
        continue
      }
    }
  }

  // All retries failed
  return {
    ok: false,
    error: lastError?.message || "Failed to send email after retries",
    code: "NETWORK_ERROR",
  }
}

/**
 * Send test email
 */
async function sendTestEmail(to: string, subject?: string): Promise<SendEmailResult> {
  const EMAIL_FROM = process.env.EMAIL_FROM
  
  if (!EMAIL_FROM) {
    return {
      ok: false,
      error: "EMAIL_FROM not configured",
      code: "UPSTREAM_MISCONFIG",
    }
  }

  const from = parseEmailFrom(EMAIL_FROM)
  const testSubject = subject || "Test Email from ClinvetIA"
  const testHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #3b82f6;">Test Email</h1>
        <p>This is a test email from ClinvetIA.</p>
        <p>If you received this, your email configuration is working correctly.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Sent at: ${new Date().toISOString()}
        </p>
      </body>
    </html>
  `
  
  const testText = `Test Email\n\nThis is a test email from ClinvetIA.\n\nSent at: ${new Date().toISOString()}`

  return sendTransacEmail({
    from,
    to: [{ email: to }],
    subject: testSubject,
    html: testHtml,
    text: testText,
  })
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error("Usage: npm run test:email -- <email@example.com> [subject]")
    console.error("Example: npm run test:email -- john@example.com \"Test Subject\"")
    process.exit(1)
  }

  const toEmail = args[0]
  const subject = args[1]

  console.log(`\n[EMAIL TEST] Sending test email to: ${toEmail}`)
  if (subject) {
    console.log(`[EMAIL TEST] Subject: ${subject}`)
  }
  console.log("")

  try {
    const result = await sendTestEmail(toEmail, subject)

    if (result.ok) {
      console.log("✅ Test email sent successfully!")
      
      if (result.skipped) {
        console.log("⚠️  Email was skipped (EMAIL_ENABLED=false)")
      } else if (result.messageId) {
        console.log(`📧 Message ID: ${result.messageId}`)
      }
    } else {
      console.error("❌ Failed to send test email")
      console.error(`Error: ${result.error}`)
      console.error(`Code: ${result.code}`)
      process.exit(1)
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    process.exit(1)
  }
}

main()
