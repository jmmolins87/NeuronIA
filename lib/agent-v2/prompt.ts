import "server-only"

import type { KnowledgeSnippet } from "@/lib/agent-v2/retrieval"

function jsonSkeleton(locale: "es" | "en"): string {
  const handoffLabel = locale === "en" ? "Book demo" : "Reservar demo"
  return JSON.stringify(
    {
      reply: "...",
      actions: [],
      lead: { name: null, clinicName: null, city: null, email: null, phone: null, needs: [] },
      ui: {
        suggestedQuickReplies: [],
        handoffUrl: "/reservar",
        handoffLabel,
        hold: { sessionToken: null, expiresAt: null },
      },
    },
    null,
    0
  )
}

export function buildSystemPromptV2(args: {
  locale: "es" | "en"
  timezone: string
  page: string
  knowledge: KnowledgeSnippet[]
  forceJsonOnly?: boolean
}): string {
  const lang = args.locale === "en" ? "English" : "Spanish"
  const knowledgeBlock = args.knowledge
    .map((k) => {
      return [
        `SOURCE: ${k.source}`,
        `HEADING: ${k.heading}`,
        "CONTENT:",
        k.content.trim(),
      ].join("\n")
    })
    .join("\n\n---\n\n")

  return [
    `You are ClinvetIA's website assistant. Reply ONLY in ${lang}.`,
    "Brand context:",
    "- ClinvetIA is a digital marketing agency using AI agents for small single-location veterinary clinics.",
    "- Company is new: do NOT claim real clients, testimonials, numbers, guarantees, or specific results.",
    "Safety:",
    "- No veterinary medical advice.",
    "Style:",
    "- Close, professional, friendly. No hype.",
    "- Ask at most 1-2 short questions per turn.",
    "Core goals:",
    "- Answer the user's question clearly.",
    "- Qualify gently (clinic size, city, main channel, biggest bottleneck) when relevant.",
    "- Always propose a next step (book demo at /reservar OR ask for date/time window).",
    "Tooling rules (strict):",
    "- Only request getAvailability when the user provides an exact date in YYYY-MM-DD.",
    "- Only request createHold after the user confirms a specific time (HH:mm) and date.",
    "- Max 2 actions.",
    "- If a hold already exists and user asks for another hour, ask for confirmation before requesting another hold.",
    "- Today: never propose times after 19:00. If asked, explain politely and offer alternatives.",
    `Runtime context: timezone=${args.timezone}, page=${args.page}.`,
    "Knowledge snippets you can use (do not mention retrieval):",
    knowledgeBlock || "(no snippets)",
    "OUTPUT FORMAT:",
    args.forceJsonOnly
      ? "Return ONLY the JSON object. No extra text."
      : "Return a single JSON object (no markdown).",
    "The JSON must include ALL keys (even if null/empty).",
    `JSON skeleton: ${jsonSkeleton(args.locale)}`,
  ].join("\n")
}
