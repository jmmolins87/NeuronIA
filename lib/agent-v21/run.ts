import "server-only"

import { retrieveKnowledge } from "@/lib/agent-v2/retrieval"
import { toolCreateHold, toolGetAvailability } from "@/lib/agent/tools"
import { calcGenericRoi, calcRoi } from "@/lib/roi/calc"
import type { AgentState, ChatInput, ChatOutput } from "@/lib/agent-v21/schema"
import { AgentStateSchema, ChatOutputSchema } from "@/lib/agent-v21/schema"
import { defaultAgentState } from "@/lib/agent-v21/state"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function monthFromName(name: string): number | null {
  const n = name.toLowerCase().trim()
  const map: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    setiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  }
  return map[n] ?? null
}

function extractDate(text: string, now: Date): string | null {
  const iso = /\b(\d{4}-\d{2}-\d{2})\b/.exec(text)?.[1]
  if (iso) return iso

  const rel = /\b(hoy|mañana)\b/i.exec(text)?.[1]?.toLowerCase()
  if (rel) {
    const d = new Date(now)
    if (rel === "mañana") d.setDate(d.getDate() + 1)
    return toIsoDate(d)
  }

  // Spanish: "10 de febrero" (optional year)
  const m = /(\b\d{1,2}\b)\s*(?:de\s+)?([a-záéíóúñ]+)(?:\s*(?:de\s+)?(\d{4}))?/i.exec(text)
  if (m) {
    const day = Number(m[1])
    const month = monthFromName(m[2] ?? "")
    const yearRaw = m[3] ? Number(m[3]) : null
    if (!month || !Number.isFinite(day) || day < 1 || day > 31) return null

    const baseYear = yearRaw ?? now.getFullYear()
    const candidate = new Date(baseYear, month - 1, day)
    if (!yearRaw) {
      // If no year, pick next occurrence (today or future), else next year.
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (candidate < startOfToday) candidate.setFullYear(baseYear + 1)
    }
    return toIsoDate(candidate)
  }

  return null
}

function extractTime(text: string): string | null {
  const hhmm = /\b(\d{2}:\d{2})\b/.exec(text)?.[1]
  if (hhmm) return hhmm

  // "a las 10" / "10 de la mañana" / "10 am"
  const m = /\b(?:a\s+las\s+)?(\d{1,2})(?:\s*(?:h|:)?\s*(\d{2}))?\s*(am|pm|de\s+la\s+mañana|de\s+la\s+tarde|de\s+la\s+noche)?\b/i.exec(
    text
  )
  if (!m) return null

  let hh = Number(m[1])
  const mm = m[2] ? Number(m[2]) : 0
  const mer = (m[3] ?? "").toLowerCase()
  if (!Number.isFinite(hh) || hh < 0 || hh > 23 || !Number.isFinite(mm) || mm < 0 || mm > 59) return null

  if (mer.includes("pm") || mer.includes("tarde") || mer.includes("noche")) {
    if (hh >= 1 && hh <= 11) hh += 12
  }
  if (mer.includes("am") || mer.includes("mañana")) {
    if (hh === 12) hh = 0
  }

  return `${pad2(hh)}:${pad2(mm)}`
}

function isAfter1930(time: string): boolean {
  return time >= "19:00"
}

function mergeState(input: ChatInput): AgentState {
  const parsed = AgentStateSchema.safeParse(input.agentState)
  return parsed.success ? parsed.data : defaultAgentState()
}

function safeLocale(locale: string): "es" | "en" {
  return locale === "en" ? "en" : "es"
}

function quick(locale: "es" | "en") {
  return locale === "en"
    ? {
        pricing: "Pricing",
        roi: "ROI",
        book: "Book a demo",
        how: "How it works",
        cont: "Continue",
      }
    : {
        pricing: "Precio",
        roi: "ROI",
        book: "Reservar demo",
        how: "Como funciona",
        cont: "Continuar",
      }
}

function buildReplyFromStage(args: {
  locale: "es" | "en"
  state: AgentState
  offeredSlots?: string[]
}): { reply: string; suggestedQuickReplies: string[] } {
  const q = quick(args.locale)

  if (args.state.stage === "ROI") {
    const missing: string[] = []
    const hasGeneric =
      typeof args.state.roiInputs.leadsMonthly === "number" ||
      typeof args.state.roiInputs.conversionCurrentPct === "number" ||
      typeof args.state.roiInputs.avgTicketEur === "number"

    if (hasGeneric) {
      if (!args.state.roiInputs.leadsMonthly) missing.push(args.locale === "en" ? "monthly leads" : "leads mensuales")
      if (!args.state.roiInputs.conversionCurrentPct) missing.push(args.locale === "en" ? "current conversion (%)" : "conversion actual (%)")
      if (!args.state.roiInputs.avgTicketEur) missing.push(args.locale === "en" ? "avg ticket (EUR)" : "ticket promedio (EUR)")
    } else {
      if (!args.state.roiInputs.clinicType) missing.push(args.locale === "en" ? "clinic type" : "tipo de clinica")
      if (!args.state.roiInputs.monthlyPatients) missing.push(args.locale === "en" ? "patients/month" : "pacientes/mes")
      if (!args.state.roiInputs.avgTicket) missing.push(args.locale === "en" ? "avg ticket" : "ticket medio")
      if (!args.state.roiInputs.missedRate) missing.push(args.locale === "en" ? "missed rate" : "tasa perdida")
    }

    const ask = args.locale === "en"
      ? `To estimate an ROI scenario, I only need ${missing.slice(0, 2).join(" and ")}. What are they for your clinic?`
      : `Para estimar un escenario de ROI, solo necesito ${missing.slice(0, 2).join(" y ")}. Cuales son en tu clinica?`

    return { reply: ask, suggestedQuickReplies: [q.roi, q.book, q.pricing] }
  }

  if (args.state.stage === "BOOKING_DATE") {
    return {
      reply: args.locale === "en" ? "Great. What date works for you? (YYYY-MM-DD)" : "Perfecto. Que fecha te viene bien? (YYYY-MM-DD)",
      suggestedQuickReplies: [q.book, q.how, q.pricing],
    }
  }

  if (args.state.stage === "BOOKING_TIME") {
    const slots = args.offeredSlots && args.offeredSlots.length > 0 ? args.offeredSlots : args.state.lastOfferedSlots
    const slotText = slots.slice(0, 3).join(", ")
    const reply = args.locale === "en"
      ? `I can offer these times: ${slotText}. Which one do you want?`
      : `Te propongo estas horas: ${slotText}. Cual prefieres?`
    return { reply, suggestedQuickReplies: slots.slice(0, 3) }
  }

  if (args.state.stage === "HOLD_CREATED" || args.state.stage === "HANDOFF") {
    return {
      reply: args.locale === "en" ? "Done. Continue on the contact page to finish." : "Listo. Continua en la pagina de contacto para terminar.",
      suggestedQuickReplies: [q.cont],
    }
  }

  // DISCOVERY default
  return {
    reply:
      args.locale === "en"
        ? "Tell me about your clinic (city and main channel: calls/web/WhatsApp). What is the biggest bottleneck today?"
        : "Cuentame un poco de tu clinica (ciudad y canal principal: llamadas/web/WhatsApp). Cual es el mayor cuello de botella hoy?",
    suggestedQuickReplies: [q.book, q.pricing, q.how, q.roi],
  }
}

export async function runChatAgentV21(args: {
  requestUrl: string
  input: ChatInput
}): Promise<ChatOutput> {
  const locale = safeLocale(args.input.locale)
  const timezone = args.input.timezone && args.input.timezone.trim() ? args.input.timezone : "Europe/Madrid"
  const state = mergeState(args.input)

  const lastUser = [...args.input.messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const now = new Date()
  const date = extractDate(lastUser, now)
  const time = extractTime(lastUser)

  // Cheap intent nudges
  const wantsBooking = /\breserv|\bbook|\bdemo|\bcita|\bagenda|horario|hueco|disponib|libre/i.test(lastUser)
  const wantsRoi = /\broi\b|calculadora|estim/i.test(lastUser)
  const wantsInfo = /en\s+que\s+consiste|que\s+es|como\s+funciona|agente\s+de\s+ia|asistente\s+de\s+ia/i.test(lastUser)

  // Stage transitions
  if (wantsRoi && state.stage === "DISCOVERY") state.stage = "ROI"
  if (wantsBooking && (state.stage === "DISCOVERY" || state.stage === "ROI")) state.stage = "BOOKING_DATE"

  // If user is asking for information, answer without forcing booking.
  if (wantsInfo && state.stage === "DISCOVERY") {
    // no stage change
  }

  // Capture booking date/time from user
  if (date) state.booking.date = date

  // ROI input capture (very simple)
  if (/\bsmall\b|\bpeque/i.test(lastUser)) state.roiInputs.clinicType = "small"
  if (/\bmedium\b|\bmedia/i.test(lastUser)) state.roiInputs.clinicType = "medium"
  if (/\blarge\b|\bgrande/i.test(lastUser)) state.roiInputs.clinicType = "large"
  if (/\bspecial/i.test(lastUser)) state.roiInputs.clinicType = "specialized"

  const nPatients = /\b(\d{2,5})\s*(pacientes|paciente|patients)\b/i.exec(lastUser)
  if (nPatients?.[1]) state.roiInputs.monthlyPatients = Number(nPatients[1])
  const nTicket = /\b(\d{2,4})\s*(€|eur|euros)\b/i.exec(lastUser)
  if (nTicket?.[1]) state.roiInputs.avgTicket = Number(nTicket[1])
  const nMissed = /\b(\d{1,2})\s*%\b/.exec(lastUser)
  if (nMissed?.[1]) state.roiInputs.missedRate = Number(nMissed[1])

  // Generic ROI input capture
  const leads = /\b(\d{1,7})\b\s*(leads?|contactos?)\b/i.exec(lastUser)
  if (leads?.[1]) state.roiInputs.leadsMonthly = Number(leads[1])

  const conv = /(conversi[oó]n|conversion)\s*(actual)?\s*[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*%/i.exec(lastUser)
  if (conv?.[3]) state.roiInputs.conversionCurrentPct = Number(conv[3])

  const ticket = /(ticket|promedio|medio)\s*[:=]?\s*(\d{2,6})\s*(€|eur|euros)?/i.exec(lastUser)
  if (ticket?.[2]) state.roiInputs.avgTicketEur = Number(ticket[2])

  const setup = /(setup|instalaci[oó]n|inicial)\s*[:=]?\s*(\d{2,7})\s*(€|eur|euros)?/i.exec(lastUser)
  if (setup?.[2]) state.roiInputs.setupCostEur = Number(setup[2])

  const monthly = /(mensual|mes)\s*[:=]?\s*(\d{2,7})\s*(€|eur|euros)?/i.exec(lastUser)
  if (monthly?.[2]) state.roiInputs.monthlyCostEur = Number(monthly[2])

  // If ROI stage and enough inputs, calculate
  if (state.stage === "ROI") {
    const canGeneric =
      typeof state.roiInputs.leadsMonthly === "number" &&
      typeof state.roiInputs.conversionCurrentPct === "number" &&
      typeof state.roiInputs.avgTicketEur === "number"

    if (canGeneric) {
      const calc = calcGenericRoi({
        leadsMonthly: state.roiInputs.leadsMonthly ?? undefined,
        conversionCurrentPct: state.roiInputs.conversionCurrentPct ?? undefined,
        avgTicketEur: state.roiInputs.avgTicketEur ?? undefined,
        improvementsPct: { capture: 4, aiAttention: 8, followUp: 7, retention: 5 },
        setupCostEur: state.roiInputs.setupCostEur ?? null,
        monthlyCostEur: state.roiInputs.monthlyCostEur ?? null,
      })
      if (calc) {
        // Map to UI summary fields used elsewhere.
        state.roiResult = {
          missedPatients: calc.result.leadsNonConverted,
          recoveredPatients: calc.result.extraSalesRounded,
          monthlyRevenue: calc.result.extraRevenueMonthly,
          yearlyRevenue: calc.result.extraRevenueYearly,
          systemCost: (calc.result.setupCostEur ?? 0) + (calc.result.monthlyCostEur ?? 0),
          roi: calc.result.roi12m ?? 0,
          breakEvenDays: 0,
          newConversionPct: calc.result.newConversionPct,
          extraSalesRounded: calc.result.extraSalesRounded,
          extraRevenueMonthly: calc.result.extraRevenueMonthly,
          roi3m: calc.result.roi3m,
          roi6m: calc.result.roi6m,
          roi12m: calc.result.roi12m,
        }
      }
    } else if (state.roiInputs.clinicType) {
      const calc = calcRoi({
        clinicType: state.roiInputs.clinicType,
        monthlyPatients: state.roiInputs.monthlyPatients ?? undefined,
        avgTicket: state.roiInputs.avgTicket ?? undefined,
        missedRate: state.roiInputs.missedRate ?? undefined,
      })
      if (calc) {
        state.roiResult = calc.result
      }
    }
  }

  // Booking flow
  let offeredSlots: string[] | undefined
  if (state.stage === "BOOKING_DATE" && state.booking.date) {
    const availability = await toolGetAvailability({ requestUrl: args.requestUrl, date: state.booking.date })
    if (isRecord(availability) && availability.ok === true && Array.isArray(availability.slots)) {
      const available = availability.slots
        .filter((s) => isRecord(s) && s.available === true && typeof s.start === "string")
        .map((s) => String(s.start))
        .filter((t) => /^\d{2}:\d{2}$/.test(t))

      const filtered = available.filter((t) => !isAfter1930(t))
      offeredSlots = filtered.slice(0, 3)
      state.lastOfferedSlots = offeredSlots
      state.stage = "BOOKING_TIME"
    }
  }

  if (state.stage === "BOOKING_TIME") {
    if (time) {
      if (isAfter1930(time)) {
        // keep stage
      } else if (state.lastOfferedSlots.includes(time)) {
        state.booking.time = time
        const hold = await toolCreateHold({
          requestUrl: args.requestUrl,
          date: state.booking.date ?? "",
          time,
          timezone,
          locale,
        })
        if (isRecord(hold) && hold.ok === true && typeof hold.sessionToken === "string") {
          state.booking.sessionToken = hold.sessionToken
          const booking = isRecord(hold.booking) ? hold.booking : null
          state.booking.expiresAt = booking && typeof booking.expiresAtISO === "string" ? booking.expiresAtISO : null
          state.stage = "HOLD_CREATED"
        }
      }
    }
  }

  if (state.stage === "HOLD_CREATED") {
    state.stage = "HANDOFF"
  }

  // Knowledge retrieval (for better reply quality)
  const snippets = await retrieveKnowledge({ locale, page: args.input.page, userText: lastUser }).catch(() => [])

  if (wantsInfo && state.stage === "DISCOVERY") {
    const offer = snippets.find((s) => s.source.includes("offer")) ?? snippets[0]
    const how = snippets.find((s) => s.source.includes("how-it-works"))

    const reply = locale === "en"
      ? `An AI agent is a website assistant that answers frequent questions, qualifies the request, and guides visitors to book a demo.\n\n${offer ? offer.content.split("\n").slice(0, 6).join("\n") : ""}\n\n${how ? how.content.split("\n").slice(0, 5).join("\n") : ""}\n\nIf you want, tell me your city and main channel (calls/web/WhatsApp).`
      : `Un agente de IA es un asistente en la web que responde dudas frecuentes, cualifica la solicitud y guia al usuario a reservar una demo.\n\n${offer ? offer.content.split("\n").slice(0, 6).join("\n") : ""}\n\n${how ? how.content.split("\n").slice(0, 5).join("\n") : ""}\n\nSi quieres, dime tu ciudad y el canal principal (llamadas/web/WhatsApp).`

    const roi = state.roiResult ? { inputs: state.roiInputs, result: state.roiResult } : null
    const output: ChatOutput = {
      reply,
      actions: [],
      lead: state.lead,
      roi,
      ui: {
        suggestedQuickReplies: [quick(locale).book, quick(locale).pricing, quick(locale).how, quick(locale).roi],
        handoffUrl: null,
        handoffLabel: null,
        handoffPayload: null,
        hold: { sessionToken: state.booking.sessionToken, expiresAt: state.booking.expiresAt },
      },
      agentState: state,
    }
    const parsed = ChatOutputSchema.safeParse(output)
    if (parsed.success) return parsed.data
  }

  const { reply, suggestedQuickReplies } = buildReplyFromStage({ locale, state, offeredSlots })

  const roi = state.roiResult
    ? { inputs: state.roiInputs, result: state.roiResult }
    : null

  const handoffReady = Boolean(state.booking.sessionToken) && Boolean(state.roiResult)
  const handoffLabel = handoffReady
    ? locale === "en" ? "Continue" : "Continuar"
    : locale === "en" ? "Book demo" : "Reservar demo"

  const ui = {
    suggestedQuickReplies,
    handoffUrl: handoffReady ? "/contacto?from=agent" : null,
    handoffLabel: handoffReady ? handoffLabel : null,
    handoffPayload: handoffReady
      ? {
          booking: state.booking,
          roi,
          lead: state.lead,
        }
      : null,
    hold: { sessionToken: state.booking.sessionToken, expiresAt: state.booking.expiresAt },
  }

  const output: ChatOutput = {
    reply,
    actions: [],
    lead: state.lead,
    roi,
    ui,
    agentState: state,
  }

  const parsed = ChatOutputSchema.safeParse(output)
  if (parsed.success) return parsed.data
  return {
    reply,
    actions: [],
    lead: defaultAgentState().lead,
    roi: null,
    ui: { suggestedQuickReplies: [], handoffUrl: null, handoffLabel: null, handoffPayload: null, hold: { sessionToken: null, expiresAt: null } },
    agentState: defaultAgentState(),
  }
}
