"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { useROIData } from "@/hooks/use-roi-data"
import { useCalendlyData } from "@/hooks/use-calendly-data"
import { useMounted } from "@/hooks/use-mounted"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { DemoButton } from "@/components/cta/demo-button"
import { CancelButton } from "@/components/cta/cancel-button"
import { RoiButton } from "@/components/cta/roi-button"
import { BookingModal } from "@/components/booking-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { 
  Send,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  TrendingUp,
  Euro,
  Calculator,
  Check,
  AlertCircle,
  Calendar,
  Info,
  X,
  Edit
} from "lucide-react"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getBookingSummaryFromStorage(value: unknown): null | {
  startAtISO: string
  timezone: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  roi: unknown
} {
  if (!isRecord(value)) return null
  const confirm = value.confirm
  const roi = value.roi
  if (!isRecord(confirm) || confirm.ok !== true) return null
  if (!isRecord(confirm.booking)) return null
  const booking = confirm.booking
  const startAtISO = typeof booking.startAtISO === "string" ? booking.startAtISO : null
  const timezone = typeof booking.timezone === "string" ? booking.timezone : "Europe/Madrid"
  const contact = isRecord(booking.contact) ? booking.contact : null

  if (!startAtISO) return null

  return {
    startAtISO,
    timezone,
    contactName: contact && typeof contact.fullName === "string" ? contact.fullName : null,
    contactEmail: contact && typeof contact.email === "string" ? contact.email : null,
    contactPhone: contact && typeof contact.phone === "string" ? contact.phone : null,
    roi,
  }
}

export default function ContactoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useTranslation()
  const { roiData, hasROIData, hasAcceptedROIData } = useROIData()
  const { calendlyData, hasCalendlyData, clearCalendlyData } = useCalendlyData()
  const mounted = useMounted()
  const [demoCancelled, setDemoCancelled] = React.useState(false)
  const [showCancelModal, setShowCancelModal] = React.useState(false)
  const [showChangeROIModal, setShowChangeROIModal] = React.useState(false)
  const [showBookingModal, setShowBookingModal] = React.useState(false)

  const isFromBooking = searchParams.get("from") === "booking"
  const [lastBookingLoaded, setLastBookingLoaded] = React.useState(false)
  const [lastBooking, setLastBooking] = React.useState<unknown>(null)

  React.useEffect(() => {
    if (!isFromBooking) {
      setLastBookingLoaded(true)
      setLastBooking(null)
      return
    }

    try {
      const raw = sessionStorage.getItem("lastBooking")
      setLastBooking(raw ? (JSON.parse(raw) as unknown) : null)
    } catch {
      setLastBooking(null)
    } finally {
      setLastBookingLoaded(true)
    }
  }, [isFromBooking])

  const bookingSummary = getBookingSummaryFromStorage(lastBooking)

  const formatBookingDateTime = React.useCallback(
    (startAtISO: string) => {
      const date = new Date(startAtISO)
      const timeZone = "Europe/Madrid"
      const dateText = new Intl.DateTimeFormat(t("common.locale"), {
        timeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(date)
      const timeText = new Intl.DateTimeFormat(t("common.locale"), {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date)
      return { dateText, timeText }
    },
    [t]
  )

  const handleCancelDemo = () => {
    clearCalendlyData()
    setDemoCancelled(true)
    setShowCancelModal(false)
  }

  const handleChangeROI = () => {
    setShowChangeROIModal(false)
    router.push("/roi#roi-calculator")
  }
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    message: "",
    calendlyUrl: ""
  })
  const [touched, setTouched] = React.useState({
    name: false,
    email: false,
    phone: false,
    clinic: false,
    message: false
  })
  const [errors, setErrors] = React.useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hasSubmittedBefore, setHasSubmittedBefore] = React.useState(false)

  const { ref: formRef } = useMountAnimation({ delay: 300, duration: 1000 })

  // Verificar localStorage al montar el componente
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const submitted = localStorage.getItem("clinvetia-contact-submitted")
      if (submitted === "true") {
        setHasSubmittedBefore(true)
      }
    }
  }, [])

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePhone = (phone: string) => {
    const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
    return regex.test(phone)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      clinic: "",
      message: ""
    }

    // Validar nombre (mínimo 5 caracteres)
    if (formData.name.trim().length === 0) {
      newErrors.name = t("contact.form.fields.name.error.required")
    } else if (formData.name.trim().length < 5) {
      newErrors.name = t("contact.form.fields.name.error.minLength")
    }

    // Validar email
    if (formData.email.trim().length === 0) {
      newErrors.email = t("contact.form.fields.email.error.required")
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("contact.form.fields.email.error.invalid")
    }

    // Validar teléfono
    if (formData.phone.trim().length === 0) {
      newErrors.phone = t("contact.form.fields.phone.error.required")
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t("contact.form.fields.phone.error.invalid")
    }

    // Validar clínica
    if (formData.clinic.trim().length === 0) {
      newErrors.clinic = t("contact.form.fields.clinic.error.required")
    } else if (formData.clinic.trim().length < 2) {
      newErrors.clinic = t("contact.form.fields.clinic.error.minLength")
    }

    // Validar mensaje (mínimo 20 caracteres)
    if (formData.message.trim().length === 0) {
      newErrors.message = t("contact.form.fields.message.error.required")
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t("contact.form.fields.message.error.minLength")
    }

    setErrors(newErrors)

    // Si hay errores, no enviar
    if (Object.values(newErrors).some(error => error !== "")) {
      return
    }

    setIsSubmitting(true)
    
    // Aquí iría la lógica de envío del formulario
    console.log("Form submitted:", {
      ...formData,
      roiData,
      dataAccepted: roiData?.accepted || false,
      acceptedTimestamp: roiData?.timestamp
    })

    window.setTimeout(() => {
      setIsSubmitting(false)
      
      // Guardar en localStorage que ya se envió el formulario
      if (typeof window !== "undefined") {
        localStorage.setItem("clinvetia-contact-submitted", "true")
        setHasSubmittedBefore(true)
      }
    }, 600)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const validateField = (name: string, value: string): string => {
    let error = ""

    switch (name) {
      case "name":
        if (value.trim().length === 0) {
          error = t("contact.form.fields.name.error.required")
        } else if (value.trim().length < 5) {
          error = t("contact.form.fields.name.error.minLength")
        }
        break
      
      case "email":
        if (value.trim().length === 0) {
          error = t("contact.form.fields.email.error.required")
        } else if (!validateEmail(value)) {
          error = t("contact.form.fields.email.error.invalid")
        }
        break
      
      case "phone":
        if (value.trim().length === 0) {
          error = t("contact.form.fields.phone.error.required")
        } else if (!validatePhone(value)) {
          error = t("contact.form.fields.phone.error.invalid")
        }
        break
      
      case "clinic":
        if (value.trim().length === 0) {
          error = t("contact.form.fields.clinic.error.required")
        } else if (value.trim().length < 2) {
          error = t("contact.form.fields.clinic.error.minLength")
        }
        break
      
      case "message":
        if (value.trim().length === 0) {
          error = t("contact.form.fields.message.error.required")
        } else if (value.trim().length < 20) {
          error = t("contact.form.fields.message.error.minLength")
        }
        break
    }

    return error
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Marcar el campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validar y establecer error
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }



  return (
    <SiteShell>
      {isFromBooking && lastBookingLoaded && !bookingSummary ? (
        <Section variant="default" className="ambient-section py-14">
          <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
          <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/80 p-8 text-center backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-foreground">{t("book.backend.contact_fallback_title")}</h1>
              <p className="mt-3 text-muted-foreground">{t("book.backend.contact_fallback_desc")}</p>
              <div className="mt-6 flex justify-center">
                <DemoButton asChild>
                  <Link href="/reservar">{t("book.backend.contact_fallback_cta")}</Link>
                </DemoButton>
              </div>
            </div>
          </div>
        </Section>
      ) : (
        <>
      {/* Hero Section */}
      <Section variant="default" className="ambient-section flex flex-col justify-center py-12 md:py-16">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Send className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl max-w-3xl mx-auto">
                {t("contact.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Contact Form Section */}
      <Section variant="muted" className="ambient-section flex flex-col justify-center py-16 md:py-20">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          {isFromBooking && bookingSummary ? (
            <Reveal delay={150}>
              <div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-primary/20 bg-card/80 p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{t("book.backend.contact_summary_title")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t("book.backend.contact_summary_desc")}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
                    {(() => {
                      const { dateText, timeText } = formatBookingDateTime(bookingSummary.startAtISO)
                      return (
                        <div className="space-y-1">
                          <div className="font-semibold capitalize text-foreground">{dateText}</div>
                          <div className="font-mono text-muted-foreground">{timeText} ({bookingSummary.timezone})</div>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-xs font-semibold text-muted-foreground">{t("contact.form.fields.name.label")}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{bookingSummary.contactName ?? "-"}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-xs font-semibold text-muted-foreground">{t("contact.form.fields.email.label")}</div>
                    <div className="mt-1 break-words text-sm font-semibold text-foreground">{bookingSummary.contactEmail ?? "-"}</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-xs font-semibold text-muted-foreground">{t("contact.form.fields.phone.label")}</div>
                    <div className="mt-1 break-words text-sm font-semibold text-foreground">{bookingSummary.contactPhone ?? "-"}</div>
                  </div>
                </div>

                {bookingSummary.roi ? (
                  <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
                    <div className="text-xs font-semibold text-muted-foreground">{t("book.backend.contact_summary_roi")}</div>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/40 p-3 text-xs text-foreground">
                      {JSON.stringify(bookingSummary.roi, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {!hasAcceptedROIData ? (
            /* No ROI Data - Redirect to Calculator */
            <Reveal delay={200}>
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border border-orange-500/50 bg-card/80 backdrop-blur-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 dark:from-orange-500 dark:to-amber-500 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {t("contact.form.roiRequired")}
                  </h2>
                  
                  {/* Alert Message Box */}
                  <div className="mb-6 p-4 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-base text-orange-700 dark:text-orange-300 text-left">
                        {hasROIData && !roiData?.accepted 
                          ? t("contact.form.roiNotAccepted")
                          : t("contact.form.roiNotCalculated")}
                      </p>
                    </div>
                  </div>
                  
                  <RoiButton asChild size="lg">
                    <Link href="/roi#roi-calculator" className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      {t("contact.form.goToROI")}
                    </Link>
                  </RoiButton>
                </div>
              </div>
            </Reveal>
          ) : roiData && (
            /* Has ROI Data - Show Form */
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
              {/* First Box: ROI Summary + Demo Status */}
              <Reveal delay={200} className="h-full">
                <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20 h-full flex flex-col">
                  {/* ROI Summary Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white dark:text-black" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {t("contact.form.roiSummary.title")}
                      </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Monthly Revenue */}
                      <div className="p-4 rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base text-muted-foreground">
                            {t("contact.form.roiSummary.monthlyRevenue")}
                          </span>
                          <Euro className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {mounted ? `${roiData.monthlyRevenue.toLocaleString()}€` : `${roiData.monthlyRevenue}€`}
                        </p>
                      </div>

                      {/* Yearly Revenue */}
                      <div className="p-4 rounded-lg border border-border bg-muted/50">
                        <p className="text-base text-muted-foreground mb-1">
                          {t("contact.form.roiSummary.yearlyRevenue")}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {mounted ? `${roiData.yearlyRevenue.toLocaleString()}€` : `${roiData.yearlyRevenue}€`}
                        </p>
                      </div>

                      {/* ROI */}
                      <div className="p-4 rounded-lg border border-border bg-muted/50">
                        <p className="text-base text-muted-foreground mb-1">
                          {t("contact.form.roiSummary.roi")}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {roiData.roi > 0 ? '+' : ''}{roiData.roi}%
                        </p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-4">
                      <p className="text-base text-muted-foreground">
                        {t("contact.form.roiSummary.calculated")}: {mounted ? new Date(roiData.timestamp).toLocaleString() : new Date(roiData.timestamp).toString()}
                      </p>
                    </div>

                    {/* Data Acceptance Notice */}
                    <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/10 dark:bg-green-500/20 p-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-base text-foreground">
                          {t("contact.form.dataAcceptance")}
                        </p>
                      </div>
                    </div>

                    {/* Change ROI Button */}
                    {!hasSubmittedBefore && (
                      <div className="mt-4 flex justify-end">
                        <RoiButton 
                          onClick={() => setShowChangeROIModal(true)}
                          className="w-full sm:w-auto cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {t("contact.form.demoStatus.changeROI")}
                        </RoiButton>
                      </div>
                    )}
                  </div>

                  {/* Demo Status Section */}
                  <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white dark:text-black" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {t("contact.form.demoStatus.label")}
                      </h2>
                    </div>

                    {demoCancelled ? (
                      /* Demo Cancelled - Red Box */
                      <div className="rounded-lg border border-red-500/50 bg-red-500/10 dark:bg-red-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-base font-medium text-red-700 dark:text-red-300 mb-1">
                              {t("contact.form.demoStatus.cancelled.title")}
                            </p>
                            <p className="text-base text-red-600/80 dark:text-red-400/80">
                              {t("contact.form.demoStatus.cancelled.message")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : hasCalendlyData && calendlyData?.scheduledDate && calendlyData?.scheduledTime ? (
                      /* Demo Booked - Green Box */
                      <div className="rounded-lg border border-green-500/50 bg-green-500/10 dark:bg-green-500/20 p-4">
                        <div>
                          <p className="text-base font-medium text-green-700 dark:text-green-300 mb-1">
                            {t("contact.form.demoStatus.booked.title")}
                          </p>
                          <p className="text-base text-green-600/80 dark:text-green-400/80">
                            {mounted 
                              ? new Date(calendlyData.scheduledDate).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })
                              : new Date(calendlyData.scheduledDate).toLocaleDateString()}
                            {" a las "}
                            {calendlyData.scheduledTime}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Demo Not Booked - Red Box */
                      <div className="rounded-lg border border-red-500/50 bg-red-500/10 dark:bg-red-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-base font-medium text-red-700 dark:text-red-300 mb-1">
                              {t("contact.form.demoStatus.notBooked.title")}
                            </p>
                            <p className="text-base text-red-600/80 dark:text-red-400/80">
                              {t("contact.form.demoStatus.notBooked.message")}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons - Below the status box */}
                    {!hasSubmittedBefore && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
                        {hasCalendlyData && calendlyData?.scheduledDate && calendlyData?.scheduledTime ? (
                          /* When demo is booked - Show Cancel and Change Date */
                          <>
                            <DemoButton
                              size="sm"
                              onClick={() => setShowBookingModal(true)}
                              className="w-full sm:w-auto"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {t("contact.form.demoStatus.changeDate")}
                            </DemoButton>
                            <CancelButton 
                              size="sm"
                              onClick={() => setShowCancelModal(true)}
                              className="w-full sm:w-auto cursor-pointer"
                            >
                              <X className="w-4 h-4 mr-2" />
                              {t("contact.form.demoStatus.cancelDemo")}
                            </CancelButton>
                          </>
                        ) : (
                          /* When no demo - Show Book Now */
                          <DemoButton
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setShowBookingModal(true)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {t("contact.form.demoStatus.bookNow")}
                          </DemoButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Second Box: Contact Form */}
              <Reveal delay={300} className="h-full">
                <div ref={formRef as React.RefObject<HTMLDivElement>} className="h-full">
                  {hasSubmittedBefore ? (
                    <div className="rounded-xl border border-green-500/50 bg-card/80 backdrop-blur-sm p-8 text-center flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center">
                        <Check className="w-8 h-8 text-white dark:text-black" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {t("contact.form.success.title")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("contact.form.success.message")}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20 h-full flex flex-col">
                      <h2 className="text-2xl font-bold mb-6 text-foreground">
                        {t("contact.form.title")}
                      </h2>

                      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                        {/* Campos en líneas separadas */}
                        <div className="space-y-6">
                          {/* Name */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-base font-medium">
                              {t("contact.form.fields.name.label")}
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("contact.form.fields.name.placeholder")}
                                className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                autoComplete="off"
                              />
                            </div>
                            {errors.name && (
                              <p className="text-base text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_oklch(var(--destructive)/0.35)]" />
                                <span>{errors.name}</span>
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-base font-medium">
                              {t("contact.form.fields.email.label")}
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder={t("contact.form.fields.email.placeholder")}
                                className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                autoComplete="off"
                              />
                            </div>
                            {errors.email && (
                              <p className="text-base text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_oklch(var(--destructive)/0.35)]" />
                                <span>{errors.email}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Teléfono y Clínica uno debajo del otro */}
                        <div className="space-y-6">
                          {/* Phone */}
                          <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-medium">
                          {t("contact.form.fields.phone.label")}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("contact.form.fields.phone.placeholder")}
                            className={`pl-10 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            autoComplete="off"
                          />
                        </div>
                            {errors.phone && (
                              <p className="text-base text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_oklch(var(--destructive)/0.35)]" />
                                <span>{errors.phone}</span>
                              </p>
                            )}
                          </div>

                          {/* Clinic */}
                          <div className="space-y-2">
                        <Label htmlFor="clinic" className="text-base font-medium">
                          {t("contact.form.fields.clinic.label")}
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="clinic"
                            name="clinic"
                            type="text"
                            value={formData.clinic}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("contact.form.fields.clinic.placeholder")}
                            className={`pl-10 ${errors.clinic ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            autoComplete="off"
                          />
                        </div>
                            {errors.clinic && (
                              <p className="text-base text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_oklch(var(--destructive)/0.35)]" />
                                <span>{errors.clinic}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mensaje */}
                        <div className="space-y-2">
                        <Label htmlFor="message" className="text-base font-medium">
                          {t("contact.form.fields.message.label")}
                        </Label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            autoComplete="off"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t("contact.form.fields.message.placeholder")}
                            className={`pl-10 min-h-[180px] ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          />
                        </div>
                          {errors.message && (
                            <p className="text-base text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 drop-shadow-[0_0_4px_oklch(var(--destructive)/0.35)]" />
                              <span>{errors.message}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex justify-start md:justify-end">
                          <DemoButton 
                            type="submit" 
                            className="w-full md:w-auto cursor-pointer dark:glow-primary"
                            disabled={
                              hasSubmittedBefore ||
                              isSubmitting ||
                              !formData.name.trim() || 
                              !formData.email.trim() || 
                              !formData.phone.trim() || 
                              !formData.clinic.trim() || 
                              !formData.message.trim() ||
                              Object.values(errors).some(error => error !== "")
                            }
                            aria-disabled={isSubmitting || hasSubmittedBefore}
                            aria-busy={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5 mr-2" />
                            )}
                            {t("contact.form.submit")}
                          </DemoButton>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </Section>

      {/* Cancel Demo Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("contact.form.demoStatus.confirmCancel")}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará tu demo reservada. Podrás reservar una nueva demo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CancelButton onClick={() => setShowCancelModal(false)}>
              {t("common.cancel")}
            </CancelButton>
            <AlertDialogAction asChild>
              <CancelButton onClick={handleCancelDemo}>
                {t("contact.form.demoStatus.cancelDemo")}
              </CancelButton>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change ROI Modal */}
      <AlertDialog open={showChangeROIModal} onOpenChange={setShowChangeROIModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("contact.form.demoStatus.changeROI")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("contact.form.demoStatus.confirmChangeROI")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeROI}>
              {t("common.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Modal with Calendar */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        onBookingComplete={(data) => {
          // Handle booking completion if needed
          console.log("Booking completed:", data)
        }}
      />
        </>
      )}
    </SiteShell>
  )
}
