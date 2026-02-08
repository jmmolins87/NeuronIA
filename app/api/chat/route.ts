import { z } from "zod"

import { okJson, errorJson } from "@/lib/api/respond"
import { env } from "@/lib/env"
import { ChatInputSchema } from "@/lib/agent-v21/schema"
import { runChatAgent } from "@/lib/agent/run"
import { runChatAgentV2 } from "@/lib/agent-v2/run"
import { runChatAgentV21 } from "@/lib/agent-v21/run"

export const runtime = "nodejs"

type RateState = { count: number; windowStartMs: number }
const rateMap = new Map<string, RateState>()
const WINDOW_MS = 60_000

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const real = request.headers.get("x-real-ip")
  if (real) return real.trim()
  return "0.0.0.0"
}

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  try {
    const json = await request.json().catch(() => null)
    const parsed = ChatInputSchema.safeParse(json)
    if (!parsed.success) {
      return errorJson("INVALID_INPUT", "Invalid input", { status: 400, fields: zodToFields(parsed.error) })
    }

    const limit = env.CHAT_RATE_LIMIT_PER_MIN ?? 30
    const key = `${ip}:${parsed.data.sessionId}`
    const now = Date.now()

    const state = rateMap.get(key)
    if (!state || now - state.windowStartMs >= WINDOW_MS) {
      rateMap.set(key, { count: 1, windowStartMs: now })
    } else {
      state.count += 1
      if (state.count > limit) {
        return errorJson("RATE_LIMITED", "Too many requests", { status: 429 })
      }
    }

    // Best-effort pruning.
    if (rateMap.size > 5000) {
      for (const [k, v] of rateMap) {
        if (now - v.windowStartMs >= WINDOW_MS) rateMap.delete(k)
      }
    }

    const version = env.CHAT_AGENT_VERSION ?? "v21"

    // Only LLM-backed agents require OPENAI_API_KEY.
    if ((version === "v1" || version === "v2") && !env.OPENAI_API_KEY) {
      return errorJson("UPSTREAM_MISCONFIG", "Chat is not configured", { status: 502 })
    }

    const result =
      version === "v1"
        ? await runChatAgent({ requestUrl: request.url, input: parsed.data })
        : version === "v2"
          ? await runChatAgentV2({ requestUrl: request.url, input: parsed.data })
          : await runChatAgentV21({ requestUrl: request.url, input: parsed.data })

    return okJson(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return errorJson("INTERNAL_ERROR", message, { status: 500 })
  }
}
