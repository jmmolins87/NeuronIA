import "server-only"

import esTranslations from "@/locales/es.json"
import enTranslations from "@/locales/en.json"

export type EmailLocale = "es" | "en"

type Translations = Record<string, unknown>

const appTranslations: Record<EmailLocale, Translations> = {
  es: esTranslations as unknown as Translations,
  en: enTranslations as unknown as Translations,
}

const fallbackEmailTranslations: Record<EmailLocale, Translations> = {
  es: {
    email: {
      bookingConfirmed: {
        subject: "Tu demo esta confirmada",
        preview: "Hemos confirmado tu cita. Puedes reagendar o cancelar cuando quieras.",
        title: "Demo confirmada",
        intro: "Gracias por reservar tu demo con ClinvetIA. Aqui tienes los detalles y el archivo para tu calendario.",
        detailsTitle: "Detalles de la cita",
        dateLabel: "Fecha",
        timeLabel: "Hora",
        timezoneLabel: "Zona horaria",
        actionsTitle: "Gestion de la cita",
        rescheduleCta: "Reagendar",
        cancelCta: "Cancelar",
        rescheduleHint: "Si necesitas cambiar la hora, puedes reagendar desde este enlace.",
        cancelHint: "Si finalmente no puedes asistir, cancela con un clic.",
        footerLegal:
          "Si tu no solicitaste esta cita, puedes ignorar este correo. Este email contiene enlaces personales de gestion.",
        companyLine: "ClinvetIA",
      },
      ics: {
        summary: "Demo ClinvetIA",
        description:
          "Demo ClinvetIA. Si necesitas cambiar o cancelar, usa los enlaces del email.",
      },
    },
  },
  en: {
    email: {
      bookingConfirmed: {
        subject: "Your demo is confirmed",
        preview: "Your appointment is confirmed. You can reschedule or cancel anytime.",
        title: "Demo confirmed",
        intro: "Thanks for booking your demo with ClinvetIA. Here are the details and a calendar invite.",
        detailsTitle: "Appointment details",
        dateLabel: "Date",
        timeLabel: "Time",
        timezoneLabel: "Time zone",
        actionsTitle: "Manage your appointment",
        rescheduleCta: "Reschedule",
        cancelCta: "Cancel",
        rescheduleHint: "Need a different time? Reschedule from this link.",
        cancelHint: "If you can’t attend, cancel with one click.",
        footerLegal:
          "If you did not request this appointment, you can ignore this email. This email contains personal management links.",
        companyLine: "ClinvetIA",
      },
      ics: {
        summary: "ClinvetIA Demo",
        description:
          "ClinvetIA demo appointment. To reschedule or cancel, use the links in the email.",
      },
    },
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

function replaceVariables(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key]?.toString() ?? match)
}

export function t(locale: EmailLocale, key: string, params?: Record<string, string | number>): string {
  const appValue = getNestedValue(appTranslations[locale], key)
  if (typeof appValue === "string") return replaceVariables(appValue, params)

  const fallbackValue = getNestedValue(fallbackEmailTranslations[locale], key)
  if (typeof fallbackValue === "string") return replaceVariables(fallbackValue, params)

  return key
}
