"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CalendarClock, CheckCircle2, Download, Loader2, RefreshCw } from "lucide-react"

import { BookingSummary } from "@/components/booking/BookingSummary"
import { SlotPicker } from "@/components/booking/SlotPicker"
import { TokenErrorState } from "@/components/booking/TokenErrorState"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NeonButton } from "@/components/ui/neon-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { useTranslation } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"

type Locale = "es" | "en"

interface BookingByTokenOk {
  ok: true
  tokenKind: "CANCEL" | "RESCHEDULE" | "SESSION"
  booking: {
    id: string
    status: string
    startAtISO: string
    endAtISO: string
    timezone: string
    locale: string
    contact: {
      name: string | null
      email: string | null
      phone: string | null
    }
    confirmedAtISO: string | null
    cancelledAtISO: string | null
  }
}

interface AvailabilityOk {
  ok: true
  date: string
  timezone: string
  slotMinutes: number
  slots: Array<{ start: string; end: string; available: boolean }>
}

interface ApiErrorPayload {
  ok: false
  code: string
  message: string
  fields?: Record<string, string>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    isRecord(value) &&
    value.ok === false &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  )
}

function hasOkTrue(value: unknown): value is { ok: true } {
  return isRecord(value) && value.ok === true
}

interface RescheduleOk {
  ok: true
  booking: BookingByTokenOk["booking"]
  fromBooking?: BookingByTokenOk["booking"]
  ics?: { url?: string }
}

function isRescheduleOk(value: unknown): value is RescheduleOk {
  if (!isRecord(value)) return false
  if (value.ok !== true) return false
  if (!("booking" in value)) return false
  return isRecord(value.booking)
}

function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en"
}

function withTimeout(timeoutMs: number) {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), timeoutMs)
  return { controller, clear: () => window.clearTimeout(id) }
}

async function fetchJson<T>(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const { controller, clear } = withTimeout(timeoutMs)
  try {
    const res = await fetch(input, { ...init, signal: controller.signal, cache: "no-store" })
    const json = (await res.json().catch(() => null)) as T | ApiErrorPayload | null
    return { res, json }
  } finally {
    clear()
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function copy(locale: Locale) {
  const es = {
    title: "Reagendar cita",
    subtitle: "Elige una nueva fecha y hora.",
    loading: "Cargando cita...",
    currentTitle: "Cita actual",
    newTitle: "Nueva cita",
    pickDate: "Selecciona una fecha",
    newDateLabel: "Nueva fecha",
    pickTime: "Horario",
    timeNotAvailable: "Hora no disponible",
    sameDayCutoff:
      "Para citas del mismo dia, a partir de las 19:00 no se permite reservar. Elige otro dia.",
    loadingSlots: "Elige una fecha para ver horarios",
    noSlots: "No hay horarios disponibles para este dia.",
    confirm: "Confirmar cambio",
    confirming: "Reagendando...",
    doneTitle: "Cita reagendada",
    doneDesc: "Tu cita ya tiene un nuevo horario.",
    wrongLinkTitle: "Enlace equivocado",
    wrongLinkDesc: "Este enlace es de cancelacion, no de reagendado.",
    invalidTitle: "Enlace no valido",
    invalidDesc: "Este enlace es incorrecto o esta incompleto.",
    expiredTitle: "Enlace expirado",
    expiredDesc: "Este enlace ya no es valido (expirado o ya utilizado).",
    retry: "Reintentar",
    refresh: "Actualizar horarios",
    backWeb: "Volver a la web",
    bookNew: "Reservar nueva cita",
    downloadIcs: "Descargar invitacion .ics",
  }

  const en = {
    title: "Reschedule appointment",
    subtitle: "Pick a new date and time.",
    loading: "Loading booking...",
    currentTitle: "Current booking",
    newTitle: "New booking",
    pickDate: "Pick a date",
    newDateLabel: "New date",
    pickTime: "Time slots",
    timeNotAvailable: "Time not available",
    sameDayCutoff:
      "For same-day bookings, after 19:00 we do not allow new reservations. Please choose another day.",
    loadingSlots: "Select a date to see time slots",
    noSlots: "No available slots for this day.",
    confirm: "Confirm change",
    confirming: "Rescheduling...",
    doneTitle: "Appointment rescheduled",
    doneDesc: "Your appointment now has a new time.",
    wrongLinkTitle: "Wrong link",
    wrongLinkDesc: "This is a cancellation link, not a reschedule link.",
    invalidTitle: "Invalid link",
    invalidDesc: "This link is incorrect or incomplete.",
    expiredTitle: "Link expired",
    expiredDesc: "This link is no longer valid (expired or already used).",
    retry: "Retry",
    refresh: "Refresh slots",
    backWeb: "Back to website",
    bookNew: "Book a new appointment",
    downloadIcs: "Download .ics invite",
  }

  return locale === "en" ? en : es
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; title: string; description: string; code?: string }
  | { kind: "ready"; payload: BookingByTokenOk }

export function RescheduleClient() {
  const params = useSearchParams()
  const { locale: providerLocale, setLocale, t } = useTranslation()

  const qpLocale = params.get("locale")
  const effectiveLocale: Locale = isLocale(qpLocale) ? qpLocale : isLocale(providerLocale) ? providerLocale : "es"

  React.useEffect(() => {
    if (isLocale(qpLocale) && qpLocale !== providerLocale) setLocale(qpLocale)
  }, [providerLocale, qpLocale, setLocale])

  const c = copy(effectiveLocale)

  const token = params.get("token")
  const [state, setState] = React.useState<LoadState>({ kind: "idle" })

  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)

  const [availability, setAvailability] = React.useState<AvailabilityOk | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = React.useState(false)
  const [availabilityError, setAvailabilityError] = React.useState<string | null>(null)

  const [submitting, setSubmitting] = React.useState(false)
  const [doneBooking, setDoneBooking] = React.useState<BookingByTokenOk["booking"] | null>(null)
  const [doneIcsUrl, setDoneIcsUrl] = React.useState<string | null>(null)

  const loadBooking = React.useCallback(async () => {
    if (!token || token.trim().length === 0) {
      setState({ kind: "error", title: c.invalidTitle, description: c.invalidDesc, code: "TOKEN_MISSING" })
      return
    }

    setState({ kind: "loading" })

    const url = `/api/bookings/by-token?token=${encodeURIComponent(token)}`
    const { res, json } = await fetchJson<BookingByTokenOk>(url, { method: "GET" }, 9000)

    if (!res.ok || !json) {
      const payload = json as ApiErrorPayload | null
      const code = payload?.code
      if (code === "TOKEN_EXPIRED" || code === "TOKEN_USED") {
        setState({ kind: "error", title: c.expiredTitle, description: c.expiredDesc, code })
        return
      }
      if (code === "TOKEN_INVALID" || code === "NOT_FOUND") {
        setState({ kind: "error", title: c.invalidTitle, description: c.invalidDesc, code })
        return
      }

      setState({ kind: "error", title: t("errors.somethingWentWrong"), description: t("errors.tryAgain"), code })
      return
    }

    if (!json.ok) {
      const payload = json as unknown as ApiErrorPayload
      setState({ kind: "error", title: t("errors.somethingWentWrong"), description: t("errors.tryAgain"), code: payload.code })
      return
    }

    if (json.tokenKind === "CANCEL") {
      setState({ kind: "error", title: c.wrongLinkTitle, description: c.wrongLinkDesc, code: "TOKEN_KIND_MISMATCH" })
      return
    }

    if (json.tokenKind !== "RESCHEDULE") {
      setState({ kind: "error", title: c.invalidTitle, description: c.invalidDesc, code: json.tokenKind })
      return
    }

    setState({ kind: "ready", payload: json })
  }, [c.expiredDesc, c.expiredTitle, c.invalidDesc, c.invalidTitle, c.wrongLinkDesc, c.wrongLinkTitle, t, token])

  React.useEffect(() => {
    void loadBooking()
  }, [loadBooking])

  const fetchAvailabilityForDate = React.useCallback(
    async (date: Date) => {
      const isoDate = toIsoDate(date)
      setAvailabilityLoading(true)
      setAvailabilityError(null)
      setAvailability(null)

      const url = `/api/availability?date=${encodeURIComponent(isoDate)}`
      const { res, json } = await fetchJson<AvailabilityOk | ApiErrorPayload>(url, { method: "GET" }, 9000)

      if (!res.ok || !hasOkTrue(json)) {
        const code = isApiErrorPayload(json) ? json.code : "AVAILABILITY_FAILED"
        setAvailabilityError(code)
        setAvailabilityLoading(false)
        return
      }

      setAvailability(json as AvailabilityOk)
      setAvailabilityLoading(false)
    },
    []
  )

  const onDateChange = React.useCallback(
    (date: Date) => {
      setSelectedDate(date)
      setSelectedTime(null)
      void fetchAvailabilityForDate(date)
    },
    [fetchAvailabilityForDate]
  )

  const onRefreshAvailability = React.useCallback(() => {
    if (!selectedDate) return
    void fetchAvailabilityForDate(selectedDate)
  }, [fetchAvailabilityForDate, selectedDate])

  const onConfirm = React.useCallback(async () => {
    if (!token || !selectedDate || !selectedTime || submitting) return

    setSubmitting(true)
    const toastId = toast.loading(c.confirming)

    try {
      const { res, json } = await fetchJson<RescheduleOk | ApiErrorPayload>(
        "/api/bookings/reschedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newDate: toIsoDate(selectedDate),
            newTime: selectedTime,
            timezone: "Europe/Madrid",
            locale: effectiveLocale,
          }),
        },
        14000
      )

      if (res.status === 409) {
        if (isApiErrorPayload(json) && json.code === "SLOT_TAKEN") {
          toast.error(effectiveLocale === "en" ? "Slot taken" : "Horario ocupado", {
            id: toastId,
            description: effectiveLocale === "en" ? "Please pick another time." : "Elige otro horario.",
          })
          setSelectedTime(null)
          onRefreshAvailability()
          return
        }
      }

      if (!res.ok || !isRescheduleOk(json)) {
        const code = isApiErrorPayload(json) ? json.code : undefined
        toast.error(effectiveLocale === "en" ? "Could not reschedule" : "No se pudo reagendar", {
          id: toastId,
          description: code,
        })
        return
      }

      toast.success(effectiveLocale === "en" ? "Rescheduled" : "Reagendada", { id: toastId })
      setDoneBooking(json.booking)
      setDoneIcsUrl(json.ics?.url ?? null)
    } catch {
      toast.error(effectiveLocale === "en" ? "Could not reschedule" : "No se pudo reagendar", { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }, [c.confirming, effectiveLocale, onRefreshAvailability, selectedDate, selectedTime, submitting, token])

  const confirmDisabled = !selectedDate || !selectedTime || availabilityLoading || submitting

  return (
    <SiteShell>
      <Toaster position="top-right" />

      <Section variant="default" className="ambient-section py-10 md:py-14">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="ClinvetIA" width={44} height={44} className="rounded-lg" priority />
              <div>
                <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{c.title}</h1>
                <p className="mt-1 text-pretty text-sm text-muted-foreground">{c.subtitle}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {state.kind === "loading" || state.kind === "idle" ? (
                <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-52" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">{c.loading}</p>
                </div>
              ) : null}

              {state.kind === "error" ? (
                <div className="space-y-4">
                  <TokenErrorState
                    locale={effectiveLocale}
                    title={state.title}
                    description={state.description}
                    code={state.code}
                    primaryHref="/contacto"
                    secondaryHref="/"
                  />
                  <Button variant="outline" onClick={() => void loadBooking()} className="w-full">
                    {c.retry}
                  </Button>
                </div>
              ) : null}

              {state.kind === "ready" ? (
                doneBooking ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/50">
                          <CheckCircle2 className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-foreground">{c.doneTitle}</h2>
                            <Badge variant="outline">{effectiveLocale === "en" ? "Updated" : "Actualizada"}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{c.doneDesc}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href="/">{c.backWeb}</Link>
                        </Button>
                        <NeonButton asChild className="w-full sm:w-auto">
                          <Link href="/reservar">{c.bookNew}</Link>
                        </NeonButton>
                        {doneIcsUrl ? (
                          <Button asChild variant="secondary" className="w-full sm:w-auto">
                            <a href={doneIcsUrl}>
                              <Download className="size-4" />
                              {c.downloadIcs}
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    <BookingSummary booking={doneBooking} locale={effectiveLocale} title={c.newTitle} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <BookingSummary booking={state.payload.booking} locale={effectiveLocale} title={c.currentTitle} />

                    <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-lg font-semibold text-foreground">{c.newTitle}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {effectiveLocale === "en" ? "Timezone: Europe/Madrid" : "Zona horaria: Europe/Madrid"}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={onRefreshAvailability}
                          disabled={!selectedDate || availabilityLoading}
                        >
                          <RefreshCw className={cn("size-4", availabilityLoading && "animate-spin")} />
                          {c.refresh}
                        </Button>
                      </div>

                      <div className="mt-5">
                        <SlotPicker
                          locale={effectiveLocale}
                          strings={{
                            pickDate: c.pickDate,
                            newDateLabel: c.newDateLabel,
                            pickTime: c.pickTime,
                            timeNotAvailable: c.timeNotAvailable,
                            sameDayCutoff: c.sameDayCutoff,
                            loadingSlots: c.loadingSlots,
                            noSlots: c.noSlots,
                          }}
                          selectedDate={selectedDate}
                          onDateChange={onDateChange}
                          selectedTime={selectedTime}
                          onTimeChange={setSelectedTime}
                          slots={availability?.slots ?? null}
                          loadingSlots={availabilityLoading}
                        />

                        {availabilityError ? (
                          <div className="mt-4 rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                            {effectiveLocale === "en" ? "Could not load slots" : "No se pudieron cargar los horarios"}
                            <span className="ml-2 font-mono text-xs">{availabilityError}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarClock className="size-4" />
                          <span>
                            {selectedDate && selectedTime
                              ? `${toIsoDate(selectedDate)} ${selectedTime}`
                              : effectiveLocale === "en"
                                ? "Select a date and time"
                                : "Selecciona fecha y hora"}
                          </span>
                        </div>
                        <NeonButton onClick={() => void onConfirm()} disabled={confirmDisabled} className="w-full sm:w-auto">
                          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                          {c.confirm}
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                )
              ) : null}

              <div className="pt-2">
                <Link className="text-sm font-semibold underline underline-offset-4" href="/">
                  {t("common.back")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  )
}
