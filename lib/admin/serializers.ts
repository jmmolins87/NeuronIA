import "server-only"

import type { Booking, BookingEvent } from "@prisma/client"

export type AdminBookingStatus = Booking["status"] | "RESCHEDULED"

export interface AdminBookingListItemDTO {
  id: string
  status: AdminBookingStatus
  startAtISO: string
  endAtISO: string
  timezone: string
  locale: string
  customerEmail: string | null
  customerName: string | null
  createdAtISO: string
  confirmedAtISO: string | null
  cancelledAtISO: string | null
  rescheduledAtISO: string | null
  internalNotes: string | null
}

export interface AdminBookingDetailDTO extends AdminBookingListItemDTO {
  formData: unknown
  roiData: unknown
}

export interface AdminBookingEventDTO {
  id: string
  type: string
  metadata: unknown
  createdAtISO: string
}

function statusForAdmin(b: Pick<Booking, "status" | "rescheduledAt">): AdminBookingStatus {
  if (b.status === "CONFIRMED" && b.rescheduledAt) return "RESCHEDULED"
  return b.status
}

export function toAdminBookingListItemDTO(b: Booking): AdminBookingListItemDTO {
  return {
    id: b.id,
    status: statusForAdmin(b),
    startAtISO: b.startAt.toISOString(),
    endAtISO: b.endAt.toISOString(),
    timezone: b.timezone,
    locale: b.locale,
    customerEmail: b.customerEmail,
    customerName: b.customerName,
    createdAtISO: b.createdAt.toISOString(),
    confirmedAtISO: b.confirmedAt ? b.confirmedAt.toISOString() : null,
    cancelledAtISO: b.cancelledAt ? b.cancelledAt.toISOString() : null,
    rescheduledAtISO: b.rescheduledAt ? b.rescheduledAt.toISOString() : null,
    internalNotes: b.internalNotes ?? null,
  }
}

export function toAdminBookingDetailDTO(b: Booking): AdminBookingDetailDTO {
  return {
    ...toAdminBookingListItemDTO(b),
    formData: b.formData,
    roiData: b.roiData,
  }
}

export function toAdminBookingEventDTO(e: BookingEvent): AdminBookingEventDTO {
  return {
    id: e.id,
    type: e.type,
    metadata: e.metadata,
    createdAtISO: e.createdAt.toISOString(),
  }
}
