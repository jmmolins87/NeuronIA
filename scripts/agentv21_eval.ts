import type { AgentState } from "@/lib/agent-v21/schema"

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function validate(payload: unknown) {
  assert(isRecord(payload), "response is not an object")
  const p = payload as Record<string, unknown>
  assert(p.ok === true, "expected ok:true")
  assert(typeof p.reply === "string" && p.reply.length > 0, "missing reply")
  assert(isRecord(p.ui), "missing ui")
  assert(isRecord(p.agentState), "missing agentState")
}

async function chat(args: {
  sessionId: string
  locale: "es" | "en"
  messages: Array<{ role: "user" | "assistant"; content: string }>
  agentState?: AgentState | null
}) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId: args.sessionId,
      locale: args.locale,
      timezone: "Europe/Madrid",
      page: "/",
      messages: args.messages,
      agentState: args.agentState ?? undefined,
    }),
  })
  const json: unknown = await res.json().catch(() => null)
  return { status: res.status, json }
}

async function run() {
  const sessionId = "eval-v21"
  let agentState: AgentState | null = null

  // 1) Discovery -> ROI
  let r = await chat({
    sessionId,
    locale: "es",
    messages: [{ role: "user", content: "Tengo una clinica veterinaria pequena en Malaga y me interesa ROI" }],
    agentState,
  })
  assert(r.status === 200, `expected 200, got ${r.status}`)
  validate(r.json)
  agentState = isRecord(r.json) ? ((r.json.agentState ?? null) as AgentState | null) : null

  // 2) Provide ROI inputs
  r = await chat({
    sessionId,
    locale: "es",
    messages: [{ role: "user", content: "Soy medium, 250 pacientes al mes, 65€, y perdemos 30%" }],
    agentState,
  })
  assert(r.status === 200, `expected 200, got ${r.status}`)
  validate(r.json)
  agentState = isRecord(r.json) ? ((r.json.agentState ?? null) as AgentState | null) : null

  // 3) Booking date
  r = await chat({
    sessionId,
    locale: "es",
    messages: [{ role: "user", content: "Quiero reservar el 2026-02-10" }],
    agentState,
  })
  assert(r.status === 200, `expected 200, got ${r.status}`)
  validate(r.json)
  agentState = isRecord(r.json) ? ((r.json.agentState ?? null) as AgentState | null) : null

  // 4) Pick time
  r = await chat({
    sessionId,
    locale: "es",
    messages: [{ role: "user", content: "11:00" }],
    agentState,
  })
  assert(r.status === 200, `expected 200, got ${r.status}`)
  validate(r.json)

  console.log("[OK] agent v2.1 eval")
}

run().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
