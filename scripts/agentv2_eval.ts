// Minimal local eval runner for Agent v2.
// Note: running .ts directly with node may require Node >= 22 with TypeScript strip-types.
// If your node cannot run .ts, rename to .mjs and run `node scripts/agentv2_eval.mjs`.

const BASE_URL = process.env.EVAL_BASE_URL || "http://localhost:3000"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function validateAgentJson(payload: unknown) {
  assert(isRecord(payload), "response is not an object")

  const p = payload as Record<string, unknown>
  assert(p.ok === true, `expected ok:true, got ${String(p.ok)}`)
  assert(typeof p.reply === "string" && p.reply.length > 0, "missing reply")
  assert(Array.isArray(p.actions), "actions must be array")
  assert(isRecord(p.lead), "lead missing")
  assert(isRecord(p.ui), "ui missing")

  const ui = p.ui as Record<string, unknown>
  assert(Array.isArray(ui.suggestedQuickReplies), "ui.suggestedQuickReplies must be array")
  assert(typeof ui.handoffUrl === "string", "ui.handoffUrl must be string")
  assert(typeof ui.handoffLabel === "string", "ui.handoffLabel must be string")
  assert(isRecord(ui.hold), "ui.hold missing")
  return true
}

async function chat(sessionId: string, locale: "es" | "en", messages: Array<{ role: string; content: string }>) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      locale,
      timezone: "Europe/Madrid",
      page: "/",
      messages,
    }),
  })
  const json = await res.json().catch(() => null)
  return { status: res.status, json }
}

async function run() {
  const cases = []

  // a) FAQ
  cases.push(async () => {
    const sessionId = "eval-faq"
    const messages = [{ role: "user", content: "Que ofreceis?" }]
    const { status, json } = await chat(sessionId, "es", messages)
    assert(status === 200, `expected 200, got ${status}`)
    validateAgentJson(json)
    console.log("[OK] FAQ")
  })

  // b) Objection
  cases.push(async () => {
    const sessionId = "eval-obj"
    const messages = [{ role: "user", content: "Ya tengo agencia, por que os necesitaria?" }]
    const { status, json } = await chat(sessionId, "es", messages)
    assert(status === 200, `expected 200, got ${status}`)
    validateAgentJson(json)
    console.log("[OK] Objecion")
  })

  // c) Booking flow -> availability -> hold
  cases.push(async () => {
    const sessionId = "eval-book"
    let messages = [{ role: "user", content: "Quiero reservar una demo el 2026-02-10 por la manana" }]
    let r = await chat(sessionId, "es", messages)
    assert(r.status === 200, `expected 200, got ${r.status}`)
    validateAgentJson(r.json)
    // user chooses a time
    messages = [...messages, { role: "assistant", content: r.json.reply }, { role: "user", content: "11:00" }]
    r = await chat(sessionId, "es", messages)
    assert(r.status === 200, `expected 200, got ${r.status}`)
    validateAgentJson(r.json)
    console.log("[OK] Booking+Hold")
  })

  // d) Cutoff 19:30
  cases.push(async () => {
    const sessionId = "eval-cutoff"
    const messages = [{ role: "user", content: "Hoy a las 20:00" }]
    const { status, json } = await chat(sessionId, "es", messages)
    assert(status === 200, `expected 200, got ${status}`)
    validateAgentJson(json)
    console.log("[OK] Cutoff")
  })

  for (const fn of cases) {
    await fn()
  }

  console.log("Done")
}

run().catch((e) => {
  console.error("Eval failed:", e && e.message ? e.message : e)
  process.exit(1)
})
