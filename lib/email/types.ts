/**
 * Email System Types
 */

export interface EmailAddress {
  email: string
  name?: string
}

export interface SendEmailParams {
  to: EmailAddress | EmailAddress[]
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: EmailAddress
}

export interface SendEmailResult {
  ok: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  code?: string
}

export interface BrevoApiResponse {
  messageId?: string
  messageIds?: string[]
}

export interface BrevoErrorResponse {
  code?: string
  message?: string
}

export type BookingLocale = "es" | "en"

export interface BookingEmailData {
  bookingId: string
  uid: string
  startAt: Date
  endAt: Date
  timezone: string
  locale: BookingLocale
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactClinicName: string | null
  roiData?: unknown
}

export interface BookingTokens {
  cancel: {
    token: string
    url: string
  }
  reschedule: {
    token: string
    url: string
  }
  session?: {
    token: string
    url: string
  }
}
