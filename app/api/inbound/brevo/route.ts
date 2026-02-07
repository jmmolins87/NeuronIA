import "server-only"

import { z } from "zod"

import { errorJson, okJson } from "@/lib/api/respond"
import { enqueueInboundMessageJob, createAgentMessage, upsertAgentThread } from "@/lib/agent/threads"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const AddressSchema = z.object({
  Address: z.string().min(1),
  Name: z.string().optional().nullable(),
})

const ItemSchema = z.object({
  From: AddressSchema,
  Subject: z.string().optional().nullable(),
  ExtractedMarkdownMessage: z.string().optional().nullable(),
  RawTextBody: z.string().optional().nullable(),
  Recipients: z.array(AddressSchema).optional().nullable(),
  MessageId: z.string().optional().nullable(),
  Uuid: z.string().optional().nullable(),
  Attachments: z.array(z.unknown()).optional().nullable(),
})

const BodySchema = z.object({
  items: z.array(ItemSchema),
})

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

function inferLocaleFromSubject(subject: string | null | undefined): "es" | "en" {
  const s = (subject ?? "").toLowerCase()
  if (s.includes("reschedule") || s.includes("cancel") || s.includes("appointment") || s.includes("booking")) return "en"
  if (s.includes("reagendar") || s.includes("cancelar") || s.includes("cita") || s.includes("reserva")) return "es"
  return "es"
}

function parsePlusAddress(address: string):
  | { kind: "thread"; id: string }
  | { kind: "booking"; id: string }
  | null {
  const localPart = address.split("@")[0] ?? ""

  const bookingDash = /\+booking-([a-zA-Z0-9_-]+)/.exec(localPart)
  if (bookingDash?.[1]) return { kind: "booking", id: bookingDash[1] }

  const threadDash = /\+thread-([a-zA-Z0-9_-]+)/.exec(localPart)
  if (threadDash?.[1]) return { kind: "thread", id: threadDash[1] }

  const bookingPlus = /\bbooking\+([a-zA-Z0-9_-]+)/.exec(localPart)
  if (bookingPlus?.[1]) return { kind: "booking", id: bookingPlus[1] }

  const threadPlus = /\bthread\+([a-zA-Z0-9_-]+)/.exec(localPart)
  if (threadPlus?.[1]) return { kind: "thread", id: threadPlus[1] }

  return null
}

async function resolveThread(args: {
  from: { address: string; name?: string | null }
  recipients: Array<{ address: string }>
  locale: "es" | "en"
  now: Date
}): Promise<{ threadId: string }> {
  const recipientPlus = args.recipients
    .map((r) => parsePlusAddress(r.address))
    .find((x): x is NonNullable<typeof x> => Boolean(x))

  if (recipientPlus?.kind === "thread") {
    const existing = await prisma.agentThread.findUnique({ where: { id: recipientPlus.id }, select: { id: true } })
    if (existing) return { threadId: existing.id }
  }

  const externalId =
    recipientPlus?.kind === "booking"
      ? `booking:${recipientPlus.id}`
      : args.from.address

  const thread = await upsertAgentThread({
    channel: "EMAIL",
    externalId,
    locale: args.locale,
    customerEmail: args.from.address,
    customerName: args.from.name ?? null,
    now: args.now,
  })

  return { threadId: thread.id }
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
  const json = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return errorJson("INVALID_INPUT", "Invalid Brevo inbound payload", { status: 400, fields: zodToFields(parsed.error) })
  }

  let processed = 0
  const results: Array<{ uuid: string | null; messageId: string; threadId: string }> = []

  for (const item of parsed.data.items) {
    const fromAddress = item.From.Address
    const fromName = item.From.Name ?? null
    const recipients = (item.Recipients ?? []).map((r) => ({ address: r.Address }))

    const locale = inferLocaleFromSubject(item.Subject)
    const { threadId } = await resolveThread({
      from: { address: fromAddress, name: fromName },
      recipients,
      locale,
      now,
    })

    const text = (item.ExtractedMarkdownMessage ?? "").trim() || (item.RawTextBody ?? "").trim() || "(empty message)"

    const message = await createAgentMessage({
      threadId,
      direction: "IN",
      text,
      raw: item,
      now,
    })

    await enqueueInboundMessageJob({ threadId, messageId: message.id, now })

    processed++
    results.push({ uuid: item.Uuid ?? null, messageId: message.id, threadId })
  }

  return okJson({ processed, results })
}

export async function GET() {
  return errorJson("METHOD_NOT_ALLOWED", "Method not allowed", { status: 405 })
}
