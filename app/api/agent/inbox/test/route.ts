import "server-only"

import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { enqueueInboundMessageJob, createAgentMessage, upsertAgentThread } from "@/lib/agent/threads"

export const runtime = "nodejs"

const BodySchema = z.object({
  channel: z.enum(["WEB_FORM", "EMAIL", "WHATSAPP"]),
  externalId: z.string().min(1),
  text: z.string().min(1),
  locale: z.enum(["es", "en"]).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function POST(request: Request) {
  const now = new Date()
  const json = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)

  if (!parsed.success) {
    return errorJson("INVALID_INPUT", "Invalid input", { status: 400, fields: zodToFields(parsed.error) })
  }

  const thread = await upsertAgentThread({
    channel: parsed.data.channel,
    externalId: parsed.data.externalId,
    locale: parsed.data.locale ?? "es",
    customerEmail: parsed.data.customerEmail ?? null,
    customerPhone: parsed.data.customerPhone ?? null,
    customerName: parsed.data.customerName ?? null,
    now,
  })

  const message = await createAgentMessage({
    threadId: thread.id,
    direction: "IN",
    text: parsed.data.text,
    raw: {
      kind: "TEST_INBOUND",
      channel: parsed.data.channel,
      externalId: parsed.data.externalId,
      payload: parsed.data,
    },
    now,
  })

  await enqueueInboundMessageJob({ threadId: thread.id, messageId: message.id, now })

  return okJson({ threadId: thread.id, messageId: message.id })
}
