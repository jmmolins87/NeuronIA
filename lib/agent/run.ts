import "server-only"

import { env } from "@/lib/env"
import type { AgentAction, AgentOutput, ChatInput, ChatMessage } from "@/lib/agent/schema"
import { AgentActionSchema, AgentOutputSchema } from "@/lib/agent/schema"
import { buildSystemPrompt } from "@/lib/agent/prompt"
import { toolCreateHold, toolGetAvailability } from "@/lib/agent/tools"

type ToolCall = { id: string; name: string; arguments: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractToolCalls(payload: unknown): ToolCall[] {
  if (!isRecord(payload)) return []
  const choices = payload.choices
  if (!Array.isArray(choices) || choices.length === 0) return []
  const message = isRecord(choices[0]) ? choices[0].message : null
  if (!isRecord(message)) return []
  const toolCalls = message.tool_calls
  if (!Array.isArray(toolCalls)) return []

  const out: ToolCall[] = []
  for (const tc of toolCalls) {
    if (!isRecord(tc)) continue
    const id = typeof tc.id === "string" ? tc.id : ""
    const fn = isRecord(tc.function) ? tc.function : null
    const name = fn && typeof fn.name === "string" ? fn.name : ""
    const args = fn && typeof fn.arguments === "string" ? fn.arguments : "{}"
    if (id && name) out.push({ id, name, arguments: args })
  }
  return out
}

function extractAssistantContent(payload: unknown): string | null {
  if (!isRecord(payload)) return null
  const choices = payload.choices
  if (!Array.isArray(choices) || choices.length === 0) return null
  const message = isRecord(choices[0]) ? choices[0].message : null
  if (!isRecord(message)) return null
  const content = message.content
  return typeof content === "string" ? content : null
}

function defaultOutput(locale: "es" | "en"): AgentOutput {
  return {
    reply:
      locale === "en"
        ? "I can help. What day works for you, and what time window?"
        : "Puedo ayudarte. Que dia te viene bien y en que franja horaria?",
    actions: [],
    lead: { name: null, clinicName: null, city: null, email: null, phone: null, needs: [] },
    ui: {
      suggestedQuickReplies:
        locale === "en" ? ["This week", "Next week", "Book a demo"] : ["Esta semana", "La semana que viene", "Reservar demo"],
      handoffUrl: "/reservar",
      handoffLabel: locale === "en" ? "Book demo" : "Reservar demo",
      hold: { sessionToken: null, expiresAt: null },
    },
  }
}

function normalizeOutput(raw: unknown, locale: "es" | "en"): AgentOutput {
  const base = defaultOutput(locale)
  if (!isRecord(raw)) return base

  const reply = typeof raw.reply === "string" ? raw.reply : typeof raw.message === "string" ? raw.message : null

  const actions: AgentAction[] = []
  if (Array.isArray(raw.actions)) {
    for (const a of raw.actions) {
      const parsed = AgentActionSchema.safeParse(a)
      if (parsed.success) actions.push(parsed.data)
      if (actions.length >= 2) break
    }
  }

  const lead = isRecord(raw.lead)
    ? {
        name: typeof raw.lead.name === "string" ? raw.lead.name : null,
        clinicName: typeof raw.lead.clinicName === "string" ? raw.lead.clinicName : null,
        city: typeof raw.lead.city === "string" ? raw.lead.city : null,
        email: typeof raw.lead.email === "string" ? raw.lead.email : null,
        phone: typeof raw.lead.phone === "string" ? raw.lead.phone : null,
        needs: Array.isArray(raw.lead.needs)
          ? raw.lead.needs.filter((n) => typeof n === "string").slice(0, 10)
          : [],
      }
    : base.lead

  const ui = isRecord(raw.ui) ? raw.ui : null
  const suggestedQuickReplies = ui && Array.isArray(ui.suggestedQuickReplies)
    ? (ui.suggestedQuickReplies.filter((s) => typeof s === "string").slice(0, 8) as string[])
    : base.ui.suggestedQuickReplies

  const handoffUrl = ui && typeof ui.handoffUrl === "string" && ui.handoffUrl.startsWith("/") ? ui.handoffUrl : base.ui.handoffUrl
  const handoffLabel = ui && typeof ui.handoffLabel === "string" && ui.handoffLabel.trim() ? ui.handoffLabel : base.ui.handoffLabel

  const hold = ui && isRecord(ui.hold)
    ? {
        sessionToken: typeof ui.hold.sessionToken === "string" ? ui.hold.sessionToken : null,
        expiresAt: typeof ui.hold.expiresAt === "string" ? ui.hold.expiresAt : null,
      }
    : base.ui.hold

  return {
    reply: reply && reply.trim() ? reply : base.reply,
    actions,
    lead,
    ui: {
      suggestedQuickReplies,
      handoffUrl,
      handoffLabel,
      hold,
    },
  }
}

async function openAiChat(args: {
  apiKey: string
  model: string
  system: string
  messages: ChatMessage[]
  toolMessages: unknown[]
}): Promise<unknown> {
  const tools = [
    {
      type: "function",
      function: {
        name: "getAvailability",
        description: "Get available time slots for a date (YYYY-MM-DD).",
        parameters: {
          type: "object",
          additionalProperties: false,
          required: ["date"],
          properties: {
            date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "createHold",
        description: "Create a temporary hold for a slot.",
        parameters: {
          type: "object",
          additionalProperties: false,
          required: ["date", "time", "timezone", "locale"],
          properties: {
            date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
            time: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
            timezone: { type: "string" },
            locale: { enum: ["es", "en"] },
          },
        },
      },
    },
  ]

  const body: Record<string, unknown> = {
    model: args.model,
    messages: [
      { role: "system", content: args.system },
      ...args.messages.map((m) => ({ role: m.role, content: m.content })),
      ...args.toolMessages,
    ],
    tools,
    tool_choice: "auto",
    response_format: { type: "json_object" },
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 400)}`)
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error("Failed to parse OpenAI response")
  }
}

export async function runChatAgent(args: {
  requestUrl: string
  input: ChatInput
}) {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY")

  const model = env.CHAT_MODEL ?? "gpt-4.1-mini"
  const system = buildSystemPrompt({
    locale: args.input.locale,
    timezone: args.input.timezone,
    page: args.input.page,
  })

  const toolMessages: unknown[] = []
  let toolCount = 0
  let lastHold: { sessionToken: string; expiresAt: string | null } | null = null

  for (let pass = 0; pass < 4; pass += 1) {
    let payload: unknown
    try {
      payload = await openAiChat({
        apiKey,
        model,
        system,
        messages: args.input.messages,
        toolMessages,
      })
    } catch {
      // Do not break the UI on upstream errors.
      return defaultOutput(args.input.locale)
    }

    const calls = extractToolCalls(payload)
    if (calls.length > 0 && toolCount < 2) {
      const assistantMessage: Record<string, unknown> = {
        role: "assistant",
        content: null,
        tool_calls: calls.map((c) => ({
          id: c.id,
          type: "function",
          function: { name: c.name, arguments: c.arguments },
        })),
      }
      toolMessages.push(assistantMessage)

      for (const call of calls) {
        if (toolCount >= 2) break
        toolCount += 1

        let out: unknown = { ok: false, code: "TOOL_ERROR", message: "Unknown tool" }
        try {
          const a = (call.arguments ? (JSON.parse(call.arguments) as unknown) : {})
          if (call.name === "getAvailability" && isRecord(a) && typeof a.date === "string") {
            out = await toolGetAvailability({ requestUrl: args.requestUrl, date: a.date })
          }
          if (
            call.name === "createHold" &&
            isRecord(a) &&
            typeof a.date === "string" &&
            typeof a.time === "string" &&
            typeof a.timezone === "string" &&
            (a.locale === "es" || a.locale === "en")
          ) {
            out = await toolCreateHold({
              requestUrl: args.requestUrl,
              date: a.date,
              time: a.time,
              timezone: a.timezone,
              locale: a.locale,
            })

            if (isRecord(out) && out.ok === true) {
              const st = out.sessionToken
              const booking = isRecord(out.booking) ? out.booking : null
              const expiresAtISO = booking && typeof booking.expiresAtISO === "string" ? booking.expiresAtISO : null
              if (typeof st === "string" && st) lastHold = { sessionToken: st, expiresAt: expiresAtISO }
            }
          }
        } catch (e: unknown) {
          out = { ok: false, code: "TOOL_ERROR", message: e instanceof Error ? e.message : "Tool failed" }
        }

        toolMessages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(out),
        })
      }

      continue
    }

    const content = extractAssistantContent(payload)
    if (!content) {
      return defaultOutput(args.input.locale)
    }

    let json: unknown = null
    try {
      json = JSON.parse(content) as unknown
    } catch {
      return defaultOutput(args.input.locale)
    }

    const normalized = normalizeOutput(json, args.input.locale)
    if (lastHold && (!normalized.ui.hold.sessionToken || normalized.ui.hold.sessionToken.length === 0)) {
      normalized.ui.hold.sessionToken = lastHold.sessionToken
      normalized.ui.hold.expiresAt = lastHold.expiresAt
    }

    const parsed = AgentOutputSchema.safeParse(normalized)
    if (!parsed.success) {
      return defaultOutput(args.input.locale)
    }
    return parsed.data
  }

  return defaultOutput(args.input.locale)
}
