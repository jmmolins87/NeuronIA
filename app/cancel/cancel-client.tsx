"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Ban, Loader2, Trash2 } from "lucide-react"

import { BookingSummary } from "@/components/booking/BookingSummary"
import { TokenErrorState } from "@/components/booking/TokenErrorState"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { DemoButton } from "@/components/cta/demo-button"
import { CancelButton } from "@/components/cta/cancel-button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NeonButton } from "@/components/ui/neon-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { useTranslation } from "@/components/providers/i18n-provider"

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

function copy(locale: Locale) {
  const es = {
    title: "Cancelar cita",
    subtitle: "Revisa los detalles antes de confirmar.",
    loading: "Cargando cita...",
    cancelCta: "Cancelar cita",
    confirmTitle: "Confirmar cancelacion",
    confirmDesc: "Esta accion cancelara tu cita. Si cambias de opinion, deberas reservar una nueva.",
    confirmYes: "Si, cancelar",
    confirmNo: "No, mantener",
    doneTitle: "Cita cancelada",
    doneDesc: "Hemos cancelado tu cita. Si necesitas un nuevo horario, puedes reservar de nuevo.",
    backWeb: "Volver a la web",
    bookAgain: "Reservar otra cita",
    invalidTitle: "Enlace no valido",
    invalidDesc: "Este enlace es incorrecto o esta incompleto.",
    expiredTitle: "Enlace expirado",
    expiredDesc: "Este enlace ya no es valido (expirado o ya utilizado).",
    kindMismatchTitle: "Enlace equivocado",
    kindMismatchDesc: "Este enlace no es de cancelacion.",
    retry: "Reintentar",
    genericErrorTitle: "No se pudo cargar",
    genericErrorDesc: "Ha ocurrido un error al cargar la cita. Intenta de nuevo.",
  }

  const en = {
    title: "Cancel appointment",
    subtitle: "Review the details before confirming.",
    loading: "Loading booking...",
    cancelCta: "Cancel appointment",
    confirmTitle: "Confirm cancellation",
    confirmDesc: "This will cancel your appointment. If you change your mind, you will need to book again.",
    confirmYes: "Yes, cancel",
    confirmNo: "No, keep",
    doneTitle: "Appointment cancelled",
    doneDesc: "Your appointment has been cancelled. If you need a new time, you can book again.",
    backWeb: "Back to website",
    bookAgain: "Book again",
    invalidTitle: "Invalid link",
    invalidDesc: "This link is incorrect or incomplete.",
    expiredTitle: "Link expired",
    expiredDesc: "This link is no longer valid (expired or already used).",
    kindMismatchTitle: "Wrong link",
    kindMismatchDesc: "This link is not for cancellation.",
    retry: "Retry",
    genericErrorTitle: "Could not load",
    genericErrorDesc: "Something went wrong while loading the booking. Please try again.",
  }

  return locale === "en" ? en : es
}

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; title: string; description: string; code?: string }
  | { kind: "ready"; payload: BookingByTokenOk }

export function CancelClient() {
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

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [cancelled, setCancelled] = React.useState(false)

  const load = React.useCallback(async () => {
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

      setState({ kind: "error", title: c.genericErrorTitle, description: c.genericErrorDesc, code })
      return
    }

    if (!json.ok) {
      const payload = json as unknown as ApiErrorPayload
      setState({ kind: "error", title: c.genericErrorTitle, description: c.genericErrorDesc, code: payload.code })
      return
    }

    if (json.tokenKind !== "CANCEL") {
      setState({ kind: "error", title: c.kindMismatchTitle, description: c.kindMismatchDesc, code: json.tokenKind })
      return
    }

    setState({ kind: "ready", payload: json })
  }, [c.expiredDesc, c.expiredTitle, c.genericErrorDesc, c.genericErrorTitle, c.invalidDesc, c.invalidTitle, c.kindMismatchDesc, c.kindMismatchTitle, token])

  React.useEffect(() => {
    void load()
  }, [load])

  const onCancel = React.useCallback(async () => {
    if (!token || submitting) return
    setSubmitting(true)

    const toastId = toast.loading(effectiveLocale === "en" ? "Cancelling..." : "Cancelando...")

    try {
      const { res, json } = await fetchJson<
        | { ok: true; booking: BookingByTokenOk["booking"]; message?: string }
        | ApiErrorPayload
      >(
        "/api/bookings/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
        12000
      )

      if (!res.ok || !hasOkTrue(json)) {
        const code = isApiErrorPayload(json) ? json.code : undefined
        toast.error(effectiveLocale === "en" ? "Could not cancel" : "No se pudo cancelar", {
          id: toastId,
          description: code,
        })
        return
      }

      const message = isRecord(json) && typeof json.message === "string" ? json.message : undefined
      toast.success(message ?? (effectiveLocale === "en" ? "Cancelled" : "Cancelada"), { id: toastId })
      setCancelled(true)
    } catch {
      toast.error(effectiveLocale === "en" ? "Could not cancel" : "No se pudo cancelar", { id: toastId })
    } finally {
      setSubmitting(false)
      setConfirmOpen(false)
    }
  }, [effectiveLocale, submitting, token])

  return (
    <SiteShell>
      <Toaster position="top-right" />

      <Section variant="default" className="ambient-section py-10 md:py-14">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ClinvetIA"
                width={44}
                height={44}
                className="rounded-lg"
                priority
              />
              <div>
                <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{c.title}</h1>
                <p className="mt-1 text-pretty text-sm text-muted-foreground">{c.subtitle}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {state.kind === "loading" || state.kind === "idle" ? (
                <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <div className="mt-6">
                    <Skeleton className="h-10 w-44 rounded-md" />
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
                  <Button variant="outline" onClick={() => void load()} className="w-full">
                    {c.retry}
                  </Button>
                </div>
              ) : null}

              {state.kind === "ready" ? (
                <>
                  <BookingSummary
                    booking={{
                      ...state.payload.booking,
                      contact: state.payload.booking.contact,
                    }}
                    locale={effectiveLocale}
                    title={effectiveLocale === "en" ? "Booking" : "Cita"}
                  />

                  {cancelled ? (
                    <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/50">
                          <Ban className="size-5 text-destructive" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-foreground">{c.doneTitle}</h2>
                            <Badge variant="destructive">{effectiveLocale === "en" ? "Cancelled" : "Cancelada"}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">{c.doneDesc}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button asChild variant="outline" className="w-full sm:w-auto">
                          <Link href="/">{c.backWeb}</Link>
                        </Button>
                        <NeonButton asChild className="w-full sm:w-auto">
                          <Link href="/reservar">{c.bookAgain}</Link>
                        </NeonButton>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{effectiveLocale === "en" ? "Action" : "Accion"}</p>
                          <p className="text-sm text-muted-foreground">
                            {effectiveLocale === "en" ? "This cannot be undone." : "Esta accion no se puede deshacer."}
                          </p>
                        </div>

                        <CancelButton
                          onClick={() => setConfirmOpen(true)}
                          disabled={submitting}
                          className="w-full sm:w-auto"
                        >
                          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          {c.cancelCta}
                        </CancelButton>
                      </div>
                    </div>
                  )}
                </>
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{c.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{c.confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CancelButton onClick={() => setConfirmOpen(false)} disabled={submitting}>
              {c.confirmNo}
            </CancelButton>
            <DemoButton onClick={() => void onCancel()} disabled={submitting}>
              {c.confirmYes}
            </DemoButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteShell>
  )
}
