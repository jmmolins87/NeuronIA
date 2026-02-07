import "server-only"

import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

export type EmailTxLocale = "es" | "en"

type Translations = Record<string, unknown>

const translations: Record<EmailTxLocale, Translations> = {
  es: esTranslations as unknown as Translations,
  en: enTranslations as unknown as Translations,
}

export type EmailTxKey =
  | "email.subject.confirmed"
  | "email.subject.cancelled"
  | "email.subject.rescheduled"
  | "email.cta.cancel"
  | "email.cta.reschedule"
  | "email.cta.downloadIcs"
  | "email.cta.bookAgain"
  | "email.labels.date"
  | "email.labels.time"
  | "email.labels.timezone"
  | "email.labels.name"
  | "email.labels.email"
  | "email.labels.phone"
  | "email.labels.clinic"
  | "email.labels.roi"
  | "email.text.cancelledIntro"
  | "email.text.rescheduledIntro"
  | "email.text.footer"

const fallback: Record<EmailTxLocale, Record<EmailTxKey, string>> = {
  es: {
    "email.subject.confirmed": "Tu cita ha sido confirmada",
    "email.subject.cancelled": "Tu cita ha sido cancelada",
    "email.subject.rescheduled": "Tu cita ha sido reagendada",

    "email.cta.cancel": "Cancelar",
    "email.cta.reschedule": "Reagendar",
    "email.cta.downloadIcs": "Descargar .ics",
    "email.cta.bookAgain": "Reservar otra cita",

    "email.labels.date": "Fecha",
    "email.labels.time": "Hora",
    "email.labels.timezone": "Zona horaria",
    "email.labels.name": "Nombre",
    "email.labels.email": "Email",
    "email.labels.phone": "Telefono",
    "email.labels.clinic": "Clinica",
    "email.labels.roi": "ROI",

    "email.text.cancelledIntro": "Hemos cancelado tu cita.",
    "email.text.rescheduledIntro": "Hemos actualizado tu cita con un nuevo horario.",
    "email.text.footer": "Si no solicitaste este cambio, responde a este email.",
  },
  en: {
    "email.subject.confirmed": "Your appointment is confirmed",
    "email.subject.cancelled": "Your appointment has been cancelled",
    "email.subject.rescheduled": "Your appointment has been rescheduled",

    "email.cta.cancel": "Cancel",
    "email.cta.reschedule": "Reschedule",
    "email.cta.downloadIcs": "Download .ics",
    "email.cta.bookAgain": "Book again",

    "email.labels.date": "Date",
    "email.labels.time": "Time",
    "email.labels.timezone": "Time zone",
    "email.labels.name": "Name",
    "email.labels.email": "Email",
    "email.labels.phone": "Phone",
    "email.labels.clinic": "Clinic",
    "email.labels.roi": "ROI",

    "email.text.cancelledIntro": "We have cancelled your appointment.",
    "email.text.rescheduledIntro": "We have updated your appointment with a new time.",
    "email.text.footer": "If you did not request this change, reply to this email.",
  },
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

export function getEmailTxStrings(locale: EmailTxLocale) {
  function t(key: EmailTxKey, variables?: Record<string, string | number>): string {
    const raw = getNestedValue(translations[locale], key)
    if (typeof raw === "string") return replaceVariables(raw, variables)
    return replaceVariables(fallback[locale][key], variables)
  }

  return { t }
}

export function coerceEmailTxLocale(value: string | null | undefined): EmailTxLocale {
  return value === "en" ? "en" : "es"
}
