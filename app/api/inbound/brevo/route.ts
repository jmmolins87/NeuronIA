import "server-only"

import { errorJson, okJson } from "@/lib/api/respond"
import { env } from "@/lib/env"
import { createAgentMessage, upsertAgentThread } from "@/lib/agent/threads"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractEmail(value: unknown): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  if (isRecord(value)) {
    const email = value.email
    if (typeof email === "string") return email
  }
  return null
}

function extractBrevoFromEmail(payload: unknown): string | null {
  if (!isRecord(payload)) return null

  // Try common shapes
  const direct = extractEmail(payload.from)
  if (direct) return direct

  const sender = extractEmail(payload.sender)
  if (sender) return sender

  const replyTo = extractEmail(payload["replyTo"]) ?? extractEmail(payload["reply_to"]) ?? extractEmail(payload["reply-to"])
  if (replyTo) return replyTo

  // Try nested arrays: from: [{ email }]
  const fromArray = payload.from
  if (Array.isArray(fromArray) && fromArray.length > 0) {
    const first = extractEmail(fromArray[0])
    if (first) return first
  }

  return null
}

function extractBrevoText(payload: unknown): string {
  if (!isRecord(payload)) return "(brevo inbound)"
  const text = payload.text
  if (typeof text === "string" && text.trim().length > 0) return text
  const subject = payload.subject
  const html = payload.html
  if (typeof subject === "string" && subject.trim().length > 0) return subject
  if (typeof html === "string" && html.trim().length > 0) return "(html message)"
  return "(brevo inbound)"
}

export async function POST(request: Request) {
  const expected = env.BREVO_INBOUND_TOKEN
  if (!expected) {
    return errorJson("BREVO_INBOUND_NOT_CONFIGURED", "BREVO_INBOUND_TOKEN is not configured", { status: 500 })
  }

  const url = new URL(request.url)
  const provided = url.searchParams.get("token")
  if (!provided || provided !== expected) {
    return errorJson("UNAUTHORIZED", "Invalid inbound token", { status: 401 })
  }

  const now = new Date()
  const payload = await request.json().catch(() => null)

  const fromEmail = extractBrevoFromEmail(payload) ?? "unknown"
  const text = extractBrevoText(payload)

  const thread = await upsertAgentThread({
    channel: "EMAIL",
    externalId: fromEmail,
    locale: "es",
    customerEmail: fromEmail === "unknown" ? null : fromEmail,
    now,
  })

  const message = await createAgentMessage({
    threadId: thread.id,
    direction: "IN",
    text,
    raw: { kind: "BREVO_INBOUND", payload },
    now,
  })

  return okJson({ threadId: thread.id, messageId: message.id })
}
