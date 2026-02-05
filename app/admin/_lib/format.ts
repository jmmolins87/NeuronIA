import type { BookingStatus } from "@/app/admin/_mock/bookings"

export function formatDateTime(value: string): string {
  try {
    const d = new Date(value)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return value
  }
}

export function formatDate(value: string): string {
  try {
    const d = new Date(value)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d)
  } catch {
    return value
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
