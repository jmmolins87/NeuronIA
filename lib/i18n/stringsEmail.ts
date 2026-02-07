import "server-only"

import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

export type EmailLocale = "es" | "en"

type Translations = Record<string, unknown>

const translations: Record<EmailLocale, Translations> = {
  es: esTranslations as unknown as Translations,
  en: enTranslations as unknown as Translations,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getNestedValue(obj: Translations, path: string): unknown {
  const keys = path.split(".")
  let current: unknown = obj

  for (const key of keys) {
    if (!isRecord(current)) return undefined
    if (!Object.prototype.hasOwnProperty.call(current, key)) return undefined
    current = current[key]
  }

  return current
}

function replaceVariables(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() ?? match
  })
}

export function getEmailStrings(locale: EmailLocale) {
  function t(key: string, variables?: Record<string, string | number>): string {
    const raw = getNestedValue(translations[locale], key)
    if (typeof raw === "string") return replaceVariables(raw, variables)
    return key
  }

  return { t }
}
