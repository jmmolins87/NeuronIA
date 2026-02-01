"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { useROIData } from "@/hooks/use-roi-data"
import { useCalendlyData } from "@/hooks/use-calendly-data"
import { useMounted } from "@/hooks/use-mounted"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { BookingCalendar } from "@/components/booking-calendar"
import Link from "next/link"
import { 
  Send,
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
  Calendar
} from "lucide-react"

export default function ContactoPage() {
  const { t } = useTranslation()
  const { roiData, hasROIData, hasAcceptedROIData } = useROIData()
  const { calendlyData, hasCalendlyData, saveCalendlyData } = useCalendlyData()
  const mounted = useMounted()
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    clinic: "",
    message: "",
    calendlyUrl: ""
  })
  const [errors, setErrors] = React.useState({
    name: "",
    email: "",
    phone: "",
    clinic: ""
  })
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [wantsCalendly, setWantsCalendly] = React.useState(() => {
    // Inicializar el checkbox marcado si ya hay datos de Calendly
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neuronia-calendly-data')
      return !!stored
    }
    return false
  })

  const { ref: formRef } = useMountAnimation({ delay: 300, duration: 1000 })

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
      clinic: ""
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres"
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Por favor, introduce un email válido"
    }

    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Por favor, introduce un teléfono válido"
    }

    if (formData.clinic.trim().length < 2) {
      newErrors.clinic = "El nombre de la clínica debe tener al menos 2 caracteres"
    }

    setErrors(newErrors)

    // Si hay errores, no enviar
    if (Object.values(newErrors).some(error => error !== "")) {
      return
    }
    
    // Aquí iría la lógica de envío del formulario
    console.log("Form submitted:", {
      ...formData,
      roiData,
      dataAccepted: roiData?.accepted || false,
      acceptedTimestamp: roiData?.timestamp
    })
    
    setIsSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        clinic: "",
        message: "",
        calendlyUrl: ""
      })
      setErrors({
        name: "",
        email: "",
        phone: "",
        clinic: ""
      })
      setWantsCalendly(false)
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error al escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  // Manejar cuando el usuario completa la reserva
  const handleBookingComplete = React.useCallback((bookingData: {
    date: Date
    time: string
    name: string
    email: string
    message?: string
  }) => {
    // Guardar datos de la reserva
    saveCalendlyData({
      eventUri: `booking-${Date.now()}`,
      inviteeUri: `invitee-${Date.now()}`,
      eventType: "Demo",
      inviteeName: bookingData.name,
      inviteeEmail: bookingData.email,
      timestamp: Date.now(),
      scheduledDate: bookingData.date.toISOString(),
      scheduledTime: bookingData.time,
      message: bookingData.message,
    })
    
    // Pre-fill form with booking data
    setFormData(prev => ({
      ...prev,
      name: bookingData.name,
      email: bookingData.email,
    }))
  }, [saveCalendlyData])

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section variant="default" className="py-12 md:py-16 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-primary dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Send className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("contact.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Contact Form Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          {!hasAcceptedROIData ? (
            /* No ROI Data - Redirect to Calculator */
            <Reveal delay={200}>
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border-2 border-orange-500/50 bg-card/80 backdrop-blur-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-orange-500 dark:to-amber-500 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {t("contact.form.roiRequired")}
                  </h2>
                  
                  {/* Alert Message Box */}
                  <div className="mb-6 p-4 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-700 dark:text-orange-300 text-left">
                        {hasROIData && !roiData?.accepted 
                          ? t("contact.form.roiNotAccepted")
                          : t("contact.form.roiNotCalculated")}
                      </p>
                    </div>
                  </div>
                  
                  <Button asChild size="lg">
                    <Link href="/roi" className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      {t("contact.form.goToROI")}
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          ) : roiData && (
            /* Has ROI Data - Show Form */
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Custom Booking Calendar - Arriba, fuera de las cajas */}
              {wantsCalendly && (
                <Reveal delay={200}>
                  <div className="rounded-xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden transition-all">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">
                          {t("contact.form.fields.calendly.title")}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <BookingCalendar 
                        onBookingComplete={handleBookingComplete}
                        prefillName={formData.name}
                        prefillEmail={formData.email}
                      />
                    </div>
                  </div>
                </Reveal>
              )}

              {/* Grid de 2 columnas: ROI Summary + Formulario */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: ROI Summary */}
                <div className="space-y-6">
                  {/* ROI Summary */}
                  <Reveal delay={300}>
                    <div className="rounded-xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gradient-to flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {t("contact.form.roiSummary.title")}
                        </h2>
                      </div>

                      <div className="space-y-4 flex-1">
                        {/* Monthly Revenue */}
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              {t("contact.form.roiSummary.monthlyRevenue")}
                            </span>
                            <Euro className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-3xl font-bold text-primary">
                            {mounted ? `${roiData.monthlyRevenue.toLocaleString()}€` : `${roiData.monthlyRevenue}€`}
                          </p>
                        </div>

                        {/* Yearly Revenue */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            {t("contact.form.roiSummary.yearlyRevenue")}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {mounted ? `${roiData.yearlyRevenue.toLocaleString()}€` : `${roiData.yearlyRevenue}€`}
                          </p>
                        </div>

                        {/* ROI */}
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            {t("contact.form.roiSummary.roi")}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {roiData.roi > 0 ? '+' : ''}{roiData.roi}%
                          </p>
                        </div>

                        {/* Timestamp */}
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            {t("contact.form.roiSummary.calculated")}: {mounted ? new Date(roiData.timestamp).toLocaleString() : new Date(roiData.timestamp).toString()}
                          </p>
                        </div>
                      </div>

                      {/* Data Acceptance Notice */}
                      <div className="mt-6 rounded-lg border border-green-500/50 bg-green-500/10 dark:bg-green-500/20 p-4">
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground">
                            {t("contact.form.dataAcceptance")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>

                {/* Right Column: Contact Form */}
                <div ref={formRef as React.RefObject<HTMLDivElement>}>
                  {isSubmitted ? (
                    <div className="rounded-xl border-2 border-green-500/50 bg-card/80 backdrop-blur-sm p-8 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center dark:glow-primary">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                      <h3 className="text-2xl font-bold mb-2 text-foreground">
                        {t("contact.form.success.title")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("contact.form.success.message")}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20 h-full flex flex-col">
                      <h2 className="text-2xl font-bold mb-6 text-foreground">
                        {t("contact.form.title")}
                      </h2>

                      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col" autoComplete="off">
                        <div className="space-y-6 flex-1">
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
                            placeholder={t("contact.form.fields.name.placeholder")}
                            className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            required
                            autoComplete="off"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
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
                            placeholder={t("contact.form.fields.email.placeholder")}
                            className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            required
                            autoComplete="off"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

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
                            placeholder={t("contact.form.fields.phone.placeholder")}
                            className={`pl-10 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            required
                            autoComplete="off"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phone}
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
                            placeholder={t("contact.form.fields.clinic.placeholder")}
                            className={`pl-10 ${errors.clinic ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            required
                            autoComplete="off"
                          />
                        </div>
                        {errors.clinic && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.clinic}
                          </p>
                        )}
                      </div>

                      {/* Message */}
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
                            placeholder={t("contact.form.fields.message.placeholder")}
                            className="pl-10 min-h-[100px]"
                          />
                        </div>
                      </div>

                      {/* Checkbox para Demo */}
                      <div 
                        onClick={() => setWantsCalendly(!wantsCalendly)}
                        className="flex items-start space-x-3 rounded-lg border border-border p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors"
                      >
                        <Checkbox
                          id="wantsDemo"
                          checked={wantsCalendly}
                          onCheckedChange={(checked) => setWantsCalendly(checked as boolean)}
                          className="pointer-events-none"
                        />
                        <div className="grid gap-1.5 leading-none pointer-events-none">
                          <Label
                            htmlFor="wantsDemo"
                            className="text-sm font-medium leading-none"
                          >
                            {t("contact.form.fields.wantsDemo.label")}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t("contact.form.fields.wantsDemo.description")}
                          </p>
                        </div>
                      </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full cursor-pointer dark:glow-primary mt-auto">
                          <Send className="w-5 h-5 mr-2" />
                          {t("contact.form.submit")}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>
    </SiteShell>
  )
}
