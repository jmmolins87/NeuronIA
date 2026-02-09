import { env } from "@/lib/env"

/**
 * Brevo (Sendinblue) Email Client - V2 Robust
 * 
 * Features:
 * - Retry logic (3 attempts for 5xx errors)
 * - Structured logging with [EMAIL] prefix
 * - EMAIL_ENABLED flag support
 * - EMAIL_FROM validation
 * - Sensitive data filtering in logs
 * 
 * Note: This file is protected by lib/env which imports "server-only"
 */

export interface BrevoAttachment {
  name: string
  content: string // base64
}

export interface SendTransacEmailArgs {
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

export interface SendEmailResult {
  ok: boolean
  messageId?: string
  skipped?: boolean
  error?: string
  code?: string
}

export class BrevoError extends Error {
  public readonly status?: number
  public readonly body?: unknown
  public readonly code?: string

  constructor(message: string, opts?: { status?: number; body?: unknown; code?: string }) {
    super(message)
    this.name = "BrevoError"
    this.status = opts?.status
    this.body = opts?.body
    this.code = opts?.code
  }
}

interface LogContext {
  to?: string
  subject?: string
  status?: number
  attempt?: number
  error?: string
  messageId?: string
  code?: string
  [key: string]: unknown
}

function log(level: "info" | "warn" | "error", message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const prefix = "[EMAIL]"
  
  const formatted = `${prefix} ${timestamp} [${level.toUpperCase()}] ${message} ${
    context ? JSON.stringify(context) : ""
  }`

  if (level === "error") {
    console.error(formatted)
  } else if (level === "warn") {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Send transactional email with retry logic and logging
 */
export async function sendTransacEmail(args: SendTransacEmailArgs): Promise<SendEmailResult>
export async function sendTransacEmail(args: SendTransacEmailArgs): Promise<SendEmailResult> {
  const recipientEmail = args.to[0]?.email || "unknown"
  
  // 1. Check if email is enabled
  if (!env.EMAIL_ENABLED) {
    log("info", "Email sending skipped (EMAIL_ENABLED=false)", {
      to: recipientEmail,
      subject: args.subject,
    })
    
    return {
      ok: true,
      skipped: true,
      code: "EMAIL_DISABLED",
    }
  }

  // 2. Validate BREVO_API_KEY
  const apiKey = env.BREVO_API_KEY
  if (!apiKey) {
    log("error", "BREVO_API_KEY not configured", {
      to: recipientEmail,
      subject: args.subject,
    })
    
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
    // Brevo API expects `attachment` (array), base64 via `content`.
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
      log("info", "Sending email via Brevo", {
        to: recipientEmail,
        subject: args.subject,
        attempt,
      })

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
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
        // Extract error details without exposing sensitive data
        const errorMessage = body && typeof body === "object" && "message" in body
          ? String((body as { message: unknown }).message)
          : typeof body === "string"
          ? body.substring(0, 200)
          : "Brevo API error"

        const errorCode = body && typeof body === "object" && "code" in body
          ? String((body as { code: unknown }).code)
          : `HTTP_${res.status}`

        log("error", "Brevo API error", {
          to: recipientEmail,
          subject: args.subject,
          status: res.status,
          attempt,
          error: errorMessage,
          code: errorCode,
        })

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

      log("info", "Email sent successfully", {
        to: recipientEmail,
        subject: args.subject,
        messageId,
        attempt,
      })

      clearTimeout(timeout)

      return {
        ok: true,
        messageId,
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (error instanceof DOMException && error.name === "AbortError") {
        log("error", "Email request timed out", {
          to: recipientEmail,
          subject: args.subject,
          attempt,
          timeoutMs,
        })
      } else {
        log("error", "Network error sending email", {
          to: recipientEmail,
          subject: args.subject,
          attempt,
          error: lastError.message,
        })
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
 * Helper: Parse EMAIL_FROM env var to extract name and email
 */
export function parseEmailFrom(emailFrom: string): { name?: string; email: string } {
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

/**
 * Send test email (for debugging)
 */
export async function sendTestEmail(to: string, subject?: string): Promise<SendEmailResult> {
  if (!env.EMAIL_FROM) {
    return {
      ok: false,
      error: "EMAIL_FROM not configured",
      code: "UPSTREAM_MISCONFIG",
    }
  }

  const from = parseEmailFrom(env.EMAIL_FROM)
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

