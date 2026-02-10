import type { BookingStatus } from "@/app/admin/_mock/bookings"

export function formatDateTime(value: string | Date): string {
  try {
    const d = value instanceof Date ? value : new Date(value)
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return typeof value === 'string' ? value : value.toISOString()
  }
}

export function formatDate(value: string | Date): string {
  try {
    const d = value instanceof Date ? value : new Date(value)
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d)
  } catch {
    return typeof value === 'string' ? value : value.toISOString()
  }
}

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "HELD":
      return "Realizada"
    case "CONFIRMED":
      return "Confirmada"
    case "CANCELLED":
      return "Cancelada"
    case "RESCHEDULED":
      return "Reagendada"
    case "EXPIRED":
      return "Expirada"
  }
}
