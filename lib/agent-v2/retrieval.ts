import "server-only"

import * as path from "path"
import { promises as fs } from "fs"

export interface KnowledgeSnippet {
  source: string
  heading: string
  content: string
}

type CachedDoc = {
  source: string
  sections: Array<{ heading: string; content: string; text: string }>
}

const cache = new Map<string, CachedDoc[]>()

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u017f\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(text: string): string[] {
  const t = normalize(text)
  if (!t) return []
  return t.split(" ").filter(Boolean)
}

function expandKeywords(tokens: string[]): string[] {
  const out = new Set(tokens)

  const add = (key: string, values: string[]) => {
    if (out.has(key)) for (const v of values) out.add(v)
  }

  add("precio", ["precios", "coste", "costo", "tarifa", "cuanto"])
  add("demo", ["reserva", "reservar", "cita", "agenda"])
  add("rgpd", ["privacidad", "datos", "legal"])
  add("ia", ["inteligencia", "agente", "asistente", "automatizacion", "automacion"])
  add("whatsapp", ["wsp", "mensaje", "mensajes"])
  add("roi", ["calculadora", "estimacion", "estimacion", "impacto"])

  return Array.from(out)
}

function splitSections(md: string): Array<{ heading: string; content: string; text: string }> {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const sections: Array<{ heading: string; content: string; text: string }> = []

  let currentHeading = "(intro)"
  let buf: string[] = []

  const flush = () => {
    const content = buf.join("\n").trim()
    if (!content) return
    const text = normalize(`${currentHeading}\n${content}`)
    sections.push({ heading: currentHeading, content, text })
  }

  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line)
    if (m) {
      flush()
      currentHeading = m[1] ?? "(section)"
      buf = []
      continue
    }
    buf.push(line)
  }
  flush()

  return sections
}

async function loadKnowledgeDocs(locale: "es" | "en"): Promise<CachedDoc[]> {
  const key = `knowledge:${locale}`
  const cached = cache.get(key)
  if (cached) return cached

  const root = process.cwd()
  const dir = path.join(root, "knowledge")

  let files: string[] = []
  try {
    files = await fs.readdir(dir)
  } catch {
    cache.set(key, [])
    return []
  }

  const preferredSuffix = `.${locale}.md`
  const fallbackSuffix = `.es.md`

  const selected = files
    .filter((f) => f.endsWith(preferredSuffix) || (locale !== "es" && f.endsWith(fallbackSuffix)))
    .sort()

  const docs: CachedDoc[] = []
  for (const file of selected) {
    const full = path.join(dir, file)
    const md = await fs.readFile(full, "utf8")
    docs.push({ source: `knowledge/${file}`, sections: splitSections(md) })
  }

  cache.set(key, docs)
  return docs
}

function scoreSection(args: { queryTokens: string[]; page: string; sectionText: string; source: string }): number {
  let score = 0
  for (const t of args.queryTokens) {
    if (!t) continue
    if (args.sectionText.includes(t)) score += 2
  }

  const page = args.page
  if (page.includes("/roi") && args.source.includes("roi")) score += 4
  if (page.includes("/reservar") && args.source.includes("booking")) score += 4
  if (page.includes("/contacto") && args.source.includes("offer")) score += 2

  return score
}

export async function retrieveKnowledge(args: {
  locale: "es" | "en"
  page: string
  userText: string
}): Promise<KnowledgeSnippet[]> {
  const docs = await loadKnowledgeDocs(args.locale)
  const tokens = expandKeywords(tokenize(`${args.userText} ${args.page}`)).slice(0, 40)

  const scored: Array<{ score: number; source: string; heading: string; content: string }> = []
  for (const doc of docs) {
    for (const sec of doc.sections) {
      const score = scoreSection({ queryTokens: tokens, page: args.page, sectionText: sec.text, source: doc.source })
      if (score <= 0) continue
      scored.push({ score, source: doc.source, heading: sec.heading, content: sec.content })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map((s) => ({ source: s.source, heading: s.heading, content: s.content }))
}
