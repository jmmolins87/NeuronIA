import "server-only"

import { env } from "@/lib/env"

export interface BrevoAttachment {
  name: string
  content: string // base64
}

export interface SendTransacEmailArgs {
  from: { name?: string; email: string }
  to: Array<{ name?: string; email: string }>
  subject: string
  html: string
  text: string
  attachments?: BrevoAttachment[]
  tags?: string[]
  timeoutMs?: number
}

export class BrevoError extends Error {
  public readonly status?: number
  public readonly body?: unknown

  constructor(message: string, opts?: { status?: number; body?: unknown }) {
    super(message)
    this.name = "BrevoError"
    this.status = opts?.status
    this.body = opts?.body
  }
}

export async function sendTransacEmail(args: SendTransacEmailArgs): Promise<{ messageId?: string }>
export async function sendTransacEmail(args: SendTransacEmailArgs) {
  const apiKey = env.BREVO_API_KEY
  if (!apiKey) {
    throw new BrevoError("Missing BREVO_API_KEY")
  }

  const controller = new AbortController()
  const timeoutMs = args.timeoutMs ?? 12_000
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

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

  if (args.attachments && args.attachments.length > 0) {
    // Brevo API expects `attachment` (array), base64 via `content`.
    payload.attachment = args.attachments.map((a) => ({ name: a.name, content: a.content }))
  }

  if (args.tags && args.tags.length > 0) {
    payload.tags = args.tags
  }

  try {
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
      throw new BrevoError("Brevo request failed", { status: res.status, body })
    }

    if (body && typeof body === "object" && body !== null && "messageId" in body) {
      const messageId = (body as { messageId?: unknown }).messageId
      return { messageId: typeof messageId === "string" ? messageId : undefined }
    }

    return {}
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new BrevoError(`Brevo request timed out after ${timeoutMs}ms`)
    }
    if (error instanceof BrevoError) throw error
    const message = error instanceof Error ? error.message : "Unknown error"
    throw new BrevoError(message)
  } finally {
    clearTimeout(timeout)
  }
}
