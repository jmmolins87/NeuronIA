"use client"

import * as React from "react"

import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

type Locale = "es" | "en"

type TranslationValue = string | Record<string, unknown>

type Translations = Record<string, TranslationValue>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined)

const translations: Record<Locale, Translations> = {
  es: esTranslations as Translations,
  en: enTranslations as Translations,
}

const LOCALE_STORAGE_KEY = "neuronia-locale"

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split(".")
  let current: TranslationValue = obj

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key] as TranslationValue
    } else {
      return path // Return key if not found
    }
  }

  return typeof current === "string" ? current : path
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
  const [isClient, setIsClient] = React.useState(false)

  // Initialize from localStorage on mount
  React.useEffect(() => {
    setIsClient(true)
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

  const t = React.useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[locale], key)
      return replaceVariables(translation, variables)
    },
    [locale]
  )

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  )

  // Prevent hydration mismatch by rendering with default locale on server
  if (!isClient) {
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = React.useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within I18nProvider")
  }
  return context
}
