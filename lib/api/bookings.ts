export interface ApiError {
  ok: false
  code: string
  message: string
  fields?: Record<string, string>
}

export type ApiResult<T extends object> = ({ ok: true } & T) | ApiError

export interface AvailabilitySlot {
  start: string
  end: string
  available: boolean
}

export type AvailabilityResponse = ApiResult<{
  date: string
  timezone: string
  slotMinutes: number
  slots: AvailabilitySlot[]
}>

export type HealthDbResponse =
  | { ok: true; db: string }
  | ApiError

export type HoldResponse = ApiResult<{
  sessionToken: string
  booking: {
    date: string
    time: string
    startAtISO: string
    endAtISO: string
    expiresAtISO: string | null
    timezone: string
    locale: string
    status: string
  }
}>

export interface EmailResult {
  enabled: boolean
  skipped: boolean
  provider?: string
  ok?: boolean
  code?: string
  messageId?: string
}

export type ConfirmResponse = ApiResult<{
  booking: {
    id: string
    status: string
    startAtISO: string
    endAtISO: string
    timezone: string
    locale: string
    confirmedAtISO: string | null
    contact: {
      fullName: string | null
      email: string | null
      phone: string | null
      clinicName: string | null
      message: string | null
    }
  }
  cancel: { token: string; url: string }
  reschedule: { token: string; url: string }
  ics: { url: string }
  email: EmailResult
}>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function parseJson(response: Response): Promise<{ ok: true; value: unknown } | { ok: false; error: ApiError }> {
  try {
    const value = (await response.json()) as unknown
    if (isRecord(value) && typeof value.ok === "boolean") {
      return { ok: true, value }
    }
    return {
      ok: false,
      error: {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Invalid JSON response",
      },
    }
  } catch {
    return {
      ok: false,
      error: {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Failed to parse JSON",
      },
    }
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(id)
  }
}

export async function getHealthDb(): Promise<HealthDbResponse> {
  const res = await fetchWithTimeout("/api/health/db", { method: "GET" }, 6000)
  const parsed = await parseJson(res)
  if (!parsed.ok) return parsed.error
  return parsed.value as HealthDbResponse
}

export async function getAvailability(date: string): Promise<AvailabilityResponse> {
  const res = await fetchWithTimeout(`/api/availability?date=${encodeURIComponent(date)}`, { method: "GET" }, 9000)
  const parsed = await parseJson(res)
  if (!parsed.ok) return parsed.error
  return parsed.value as AvailabilityResponse
}

export async function createHold(payload: {
  date: string
  time: string
  timezone: "Europe/Madrid"
  locale: "es" | "en"
}): Promise<HoldResponse> {
  const res = await fetchWithTimeout(
    "/api/bookings",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
    12_000
  )
  const parsed = await parseJson(res)
  if (!parsed.ok) return parsed.error
  return parsed.value as HoldResponse
}

export async function confirmBooking(payload: {
  sessionToken: string
  locale: "es" | "en"
  contact: {
    fullName: string
    email: string
    phone: string
    clinicName?: string
    message?: string
  }
  roi: unknown
}): Promise<ConfirmResponse> {
  const res = await fetchWithTimeout(
    "/api/bookings/confirm",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
    14_000
  )
  const parsed = await parseJson(res)
  if (!parsed.ok) return parsed.error
  return parsed.value as ConfirmResponse
}

export async function freeSlot(_sessionToken: string): Promise<ApiError> {
  // No backend endpoint implemented yet.
  // Recommended: POST /api/bookings/free { sessionToken } to release a HOLD before expiry.
  return { ok: false, code: "NOT_IMPLEMENTED", message: "Free slot endpoint not implemented" }
}
