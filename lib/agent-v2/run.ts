import "server-only"

import { env } from "@/lib/env"
import type { AgentAction, AgentOutput, ChatInput, ChatMessage } from "@/lib/agent-v2/schema"
import { AgentActionSchema, AgentOutputSchema } from "@/lib/agent-v2/schema"
import { retrieveKnowledge } from "@/lib/agent-v2/retrieval"
import { buildSystemPromptV2 } from "@/lib/agent-v2/prompt"
import { toolCreateHold, toolGetAvailability } from "@/lib/agent-v2/tools"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function defaultOutput(locale: "es" | "en"): AgentOutput {
  return {
    reply:
      locale === "en"
        ? "Sorry - I had trouble answering. Want to book a demo? Tell me a date (YYYY-MM-DD)."
        : "Perdon, he tenido un problema al responder. Quieres reservar una demo? Dime una fecha (YYYY-MM-DD).",
    actions: [],
    lead: { name: null, clinicName: null, city: null, email: null, phone: null, needs: [] },
    ui: {
      suggestedQuickReplies:
        locale === "en"
          ? ["Book a demo", "Pricing", "How it works", "ROI"]
          : ["Reservar demo", "Precio", "Como funciona", "ROI"],
      handoffUrl: "/reservar",
      handoffLabel: locale === "en" ? "Book demo" : "Reservar demo",
      hold: { sessionToken: null, expiresAt: null },
    },
  }
}

async function openAiJson(args: {
  apiKey: string
  model: string
  system: string
  messages: ChatMessage[]
}): Promise<unknown> {
  const body: Record<string, unknown> = {
    model: args.model,
    messages: [{ role: "system", content: args.system }, ...args.messages],
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
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 300)}`)
  return JSON.parse(text) as unknown
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

function normalizeOutput(raw: unknown, locale: "es" | "en"): AgentOutput {
  const base = defaultOutput(locale)
  if (!isRecord(raw)) return base

  const reply = typeof raw.reply === "string" ? raw.reply : null

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
        needs: Array.isArray(raw.lead.needs) ? raw.lead.needs.filter((n) => typeof n === "string").slice(0, 10) : [],
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
    ui: { suggestedQuickReplies, handoffUrl, handoffLabel, hold },
  }
}

async function runModelOnce(args: {
  input: ChatInput
  forceJsonOnly?: boolean
  extraMessages?: ChatMessage[]
}): Promise<AgentOutput> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY")

  const model = env.CHAT_MODEL ?? "gpt-4.1-mini"
  const lastUser = [...args.input.messages].reverse().find((m) => m.role === "user")?.content ?? ""

  const knowledge = await retrieveKnowledge({
    locale: args.input.locale,
    page: args.input.page,
    userText: lastUser,
  })

  const system = buildSystemPromptV2({
    locale: args.input.locale,
    timezone: args.input.timezone,
    page: args.input.page,
    knowledge,
    forceJsonOnly: args.forceJsonOnly,
  })

  const messages: ChatMessage[] = [...args.input.messages]
  if (args.extraMessages && args.extraMessages.length > 0) messages.push(...args.extraMessages)

  const payload = await openAiJson({ apiKey, model, system, messages })
  const content = extractAssistantContent(payload)
  if (!content) throw new Error("Missing assistant content")
  const json = JSON.parse(content) as unknown
  const normalized = normalizeOutput(json, args.input.locale)

  const parsed = AgentOutputSchema.safeParse(normalized)
  if (!parsed.success) throw new Error("Invalid schema")
  return parsed.data
}

async function executeActions(args: {
  requestUrl: string
  input: ChatInput
  actions: AgentAction[]
}): Promise<{ toolResults: Array<{ action: AgentAction; result: unknown }>; hold: { sessionToken: string | null; expiresAt: string | null } } > {
  const toolResults: Array<{ action: AgentAction; result: unknown }> = []
  const hold: { sessionToken: string | null; expiresAt: string | null } = { sessionToken: null, expiresAt: null }

  for (const action of args.actions.slice(0, 2)) {
    if (action.type === "getAvailability") {
      const result = await toolGetAvailability({ requestUrl: args.requestUrl, date: action.date })
      toolResults.push({ action, result })
    }
    if (action.type === "createHold") {
      const timezone = args.input.timezone && args.input.timezone.trim() ? args.input.timezone : "Europe/Madrid"
      const locale = args.input.locale === "en" ? "en" : "es"
      const result = await toolCreateHold({ requestUrl: args.requestUrl, date: action.date, time: action.time, timezone, locale })
      toolResults.push({ action, result })

      if (isRecord(result) && result.ok === true) {
        hold.sessionToken = typeof result.sessionToken === "string" ? result.sessionToken : null
        const booking = isRecord(result.booking) ? result.booking : null
        hold.expiresAt = booking && typeof booking.expiresAtISO === "string" ? booking.expiresAtISO : null
      }
    }
  }

  return { toolResults, hold }
}

function toolResultsToMessages(locale: "es" | "en", toolResults: Array<{ action: AgentAction; result: unknown }>): ChatMessage[] {
  const header = locale === "en" ? "Tool results (JSON):" : "Resultados de herramientas (JSON):"
  return [
    {
      role: "assistant",
      content: `${header}\n${JSON.stringify(toolResults, null, 2)}`,
    },
  ]
}

export async function runChatAgentV2(args: {
  requestUrl: string
  input: ChatInput
}): Promise<AgentOutput> {
  try {
    // 1) First attempt
    let first: AgentOutput
    try {
      first = await runModelOnce({ input: args.input })
    } catch {
      // Retry once forcing JSON-only
      first = await runModelOnce({ input: args.input, forceJsonOnly: true }).catch(() => defaultOutput(args.input.locale))
    }

    // 2) Execute up to 2 actions
    const actions = first.actions
    if (!actions || actions.length === 0) return first

    const exec = await executeActions({ requestUrl: args.requestUrl, input: args.input, actions })
    const extra = toolResultsToMessages(args.input.locale, exec.toolResults)

    // 3) Second model call: incorporate tool results and ask for final JSON (no more actions)
    let second: AgentOutput
    try {
      second = await runModelOnce({
        input: args.input,
        forceJsonOnly: true,
        extraMessages: [
          ...extra,
          {
            role: "assistant",
            content:
              args.input.locale === "en"
                ? "Now produce the final JSON response. actions must be an empty array."
                : "Ahora produce la respuesta final en JSON. actions debe ser un array vacio.",
          },
        ],
      })
    } catch {
      second = defaultOutput(args.input.locale)
    }

    // 4) If hold created, override ui.hold + handoff url/label
    if (exec.hold.sessionToken) {
      const token = exec.hold.sessionToken
      second.ui.hold.sessionToken = token
      second.ui.hold.expiresAt = exec.hold.expiresAt
      second.ui.handoffUrl = `/reservar?from=chat&sessionToken=${encodeURIComponent(token)}`
      second.ui.handoffLabel = args.input.locale === "en" ? "Continue booking" : "Continuar reserva"
    }

    // Always clear actions in final response if model forgot.
    second.actions = []
    return second
  } catch {
    return defaultOutput(args.input.locale)
  }
}
