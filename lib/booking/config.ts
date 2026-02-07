import "server-only"

import { env } from "@/lib/env"

export interface BookingConfig {
  timeZone: "Europe/Madrid"
  startTime: string // HH:mm
  endTime: string // HH:mm
  slotMinutes: number
  holdTtlMinutes: number
  allowTimeOverride: boolean
  cutoffMinutes: number
  cancelTokenExpiryDays: number
  rescheduleTokenExpiryDays: number
}

export const bookingConfig: BookingConfig = {
  timeZone: env.BOOKING_TIMEZONE,
  startTime: env.BOOKING_START_TIME,
  endTime: env.BOOKING_END_TIME,
  slotMinutes: env.BOOKING_SLOT_MINUTES,
  holdTtlMinutes: env.HOLD_TTL_MINUTES,
  allowTimeOverride:
    env.ALLOW_TIME_OVERRIDE ?? (env.NODE_ENV !== "production"),
  // Prepared for future: minimum lead time before a slot can be held.
  // (Not enforced unless set > 0.)
  cutoffMinutes: 0,
  cancelTokenExpiryDays: env.CANCEL_TOKEN_EXPIRY_DAYS,
  rescheduleTokenExpiryDays: env.RESCHEDULE_TOKEN_EXPIRY_DAYS,
}
