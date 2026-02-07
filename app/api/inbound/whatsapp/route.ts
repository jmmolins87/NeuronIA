import "server-only"

import { errorJson, okJson } from "@/lib/api/respond"
import { env } from "@/lib/env"
import { createAgentMessage, upsertAgentThread } from "@/lib/agent/threads"

export const runtime = "nodejs"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractWhatsAppMessage(payload: unknown): { from: string | null; text: string } {
  // WhatsApp Cloud API typical shape: entry[0].changes[0].value.messages[0]
  if (!isRecord(payload)) return { from: null, text: "(whatsapp inbound)" }

  const entry = payload.entry
  if (!Array.isArray(entry) || entry.length === 0) return { from: null, text: "(whatsapp inbound)" }
  const firstEntry = entry[0]
  if (!isRecord(firstEntry)) return { from: null, text: "(whatsapp inbound)" }

  const changes = firstEntry.changes
  if (!Array.isArray(changes) || changes.length === 0) return { from: null, text: "(whatsapp inbound)" }

  const firstChange = changes[0]
  if (!isRecord(firstChange)) return { from: null, text: "(whatsapp inbound)" }

  const value = firstChange.value
  if (!isRecord(value)) return { from: null, text: "(whatsapp inbound)" }

  const messages = value.messages
  const msg = Array.isArray(messages) && messages.length > 0 && isRecord(messages[0]) ? messages[0] : null

  const from = msg && typeof msg.from === "string" ? msg.from : null
  const textObj = msg && isRecord(msg.text) ? msg.text : null
  const text = textObj && typeof textObj.body === "string" ? textObj.body : "(whatsapp inbound)"

  return { from, text }
}

export async function GET(request: Request) {
  const expected = env.WHATSAPP_VERIFY_TOKEN
  if (!expected) {
    return errorJson("WHATSAPP_NOT_CONFIGURED", "WHATSAPP_VERIFY_TOKEN is not configured", { status: 500 })
  }

  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (mode !== "subscribe" || !challenge) {
    return errorJson("INVALID_INPUT", "Missing hub params", { status: 400 })
  }

  if (!token || token !== expected) {
    return errorJson("UNAUTHORIZED", "Invalid verify token", { status: 401 })
  }

  return okJson({ challenge })
}

export async function POST(request: Request) {
  const now = new Date()
  const payload = await request.json().catch(() => null)

  const extracted = extractWhatsAppMessage(payload)
  const externalId = extracted.from ?? "unknown"

  const thread = await upsertAgentThread({
    channel: "WHATSAPP",
    externalId,
    locale: "es",
    customerPhone: extracted.from,
    now,
  })

  const message = await createAgentMessage({
    threadId: thread.id,
    direction: "IN",
    text: extracted.text,
    raw: { kind: "WHATSAPP_INBOUND", payload },
    now,
  })

  return okJson({ threadId: thread.id, messageId: message.id })
}
