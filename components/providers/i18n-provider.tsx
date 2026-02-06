"use client"

import * as React from "react"

import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

type Locale = "es" | "en"

type Translations = Record<string, unknown>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => string
  tRaw: (key: string) => unknown
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined)

const translations: Record<Locale, Translations> = {
  es: esTranslations as unknown as Translations,
  en: enTranslations as unknown as Translations,
}

const LOCALE_STORAGE_KEY = "clinvetia-locale"

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

function replaceVariables(
  text: string,
  variables?: Record<string, string | number>
): string {
  if (!variables) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() ?? match
  })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("es")

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (savedLocale && (savedLocale === "es" || savedLocale === "en")) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    }
  }, [])

  const tRaw = React.useCallback((key: string): unknown => {
    return getNestedValue(translations[locale], key)
  }, [locale])

  const t = React.useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const translation = tRaw(key)

      if (typeof translation === "string") {
        return replaceVariables(translation, variables)
      }

      return key
    },
    [tRaw]
  )

  const value: I18nContextType = React.useMemo(
    () => ({ locale, setLocale, t, tRaw }),
    [locale, setLocale, t, tRaw]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = React.useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within I18nProvider")
  }
  return context
}
