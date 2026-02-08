"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { useCalendlyData } from "@/hooks/use-calendly-data"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { DemoButton } from "@/components/cta/demo-button"
import { CancelButton } from "@/components/cta/cancel-button"
import { BookingCalendar } from "@/components/booking-calendar"
import type { BookingCompleteData } from "@/components/booking-calendar"
import { Toaster } from "@/components/ui/sonner"
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
import { 
  Calendar,
  Info
} from "lucide-react"

export default function ReservarPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { saveCalendlyData } = useCalendlyData()
  const [hasInteracted, setHasInteracted] = React.useState(false)
  const [showLeaveWarning, setShowLeaveWarning] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null)
  const [hasSubmittedBefore, setHasSubmittedBefore] = React.useState(false)
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = React.useState(false)

  // Verificar si el usuario ya envió el formulario
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const submitted = localStorage.getItem("clinvetia-contact-submitted")
      if (submitted === "true") {
        setHasSubmittedBefore(true)
        setShowAlreadySubmittedModal(true)
      }
    }
  }, [])

  // Manejar cuando el usuario completa la reserva
  const handleBookingComplete = React.useCallback((bookingData: BookingCompleteData) => {
    // Marcar como completado para no mostrar advertencia
    setHasInteracted(false)
    // Guardar datos de la reserva
    saveCalendlyData({
      eventUri: `booking-${Date.now()}`,
      inviteeUri: `invitee-${Date.now()}`,
      eventType: "Demo",
      inviteeName: bookingData.confirm.booking.contact.fullName ?? undefined,
      inviteeEmail: bookingData.confirm.booking.contact.email ?? undefined,
      timestamp: Date.now(),
      scheduledDate: bookingData.confirm.booking.startAtISO,
      scheduledTime: bookingData.time,
      message: undefined,
    })

    if (typeof window !== "undefined") {
      try {
        const roiRaw = localStorage.getItem("clinvetia-roi-data")
        const roi = roiRaw ? JSON.parse(roiRaw) : null
        sessionStorage.setItem(
          "lastBooking",
          JSON.stringify({
            confirm: bookingData.confirm,
            dateISO: bookingData.date.toISOString(),
            time: bookingData.time,
            roi,
          })
        )
      } catch {
        // ignore
      }
    }
    
    // Redirigir a contacto después de agendar
    setTimeout(() => {
      router.push("/contacto?from=booking")
    }, 1500)
  }, [router, saveCalendlyData])

  // Interceptar clicks en enlaces para mostrar modal
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!hasInteracted) return

      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (link && link.href && !link.href.includes("/reservar")) {
        e.preventDefault()
        e.stopPropagation()
        setPendingNavigation(link.href)
        setShowLeaveWarning(true)
      }
    }

    document.addEventListener("click", handleClick, { capture: true })
    return () => document.removeEventListener("click", handleClick, { capture: true })
  }, [hasInteracted])

  const handleConfirmLeave = React.useCallback(() => {
    setHasInteracted(false)
    setShowLeaveWarning(false)
    if (pendingNavigation) {
      window.location.href = pendingNavigation
    }
  }, [pendingNavigation])

  const handleCancelLeave = React.useCallback(() => {
    setShowLeaveWarning(false)
    setPendingNavigation(null)
  }, [])

  const handleGoToContact = React.useCallback(() => {
    router.push("/contacto")
  }, [router])

  const handleGoToHome = React.useCallback(() => {
    router.push("/")
  }, [router])

  return (
    <SiteShell>
      <Toaster position="bottom-right" />
      {/* Hero Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Calendar className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {t("book.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("book.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Calendly Section */}
      <Section variant="muted" className="ambient-section py-12 md:py-16">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto">
            {/* Custom Booking Calendar */}
            <Reveal delay={200}>
              {hasSubmittedBefore ? (
                <div className="rounded-xl border border-blue-500/50 bg-card/80 backdrop-blur-sm p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center">
                    <Info className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {t("booking.alreadySubmitted.title")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t("booking.alreadySubmitted.description")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <DemoButton onClick={handleGoToHome}>
                      {t("booking.alreadySubmitted.goBack")}
                    </DemoButton>
                    <DemoButton onClick={handleGoToContact}>
                      {t("booking.alreadySubmitted.goToContact")}
                    </DemoButton>
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-sm overflow-hidden mb-8 p-6">
                  <BookingCalendar 
                    onBookingComplete={handleBookingComplete}
                    onDateSelected={() => setHasInteracted(true)}
                  />
                </div>
              )}
            </Reveal>


          </div>
        </div>
      </Section>

      {/* Leave Warning Modal */}
      <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("booking.leaveWarning.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("booking.leaveWarning.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <CancelButton onClick={handleConfirmLeave}>
              {t("booking.leaveWarning.leave")}
            </CancelButton>
            <AlertDialogCancel variant="default" size="lg" onClick={handleCancelLeave}>
              {t("booking.leaveWarning.stay")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Already Submitted Modal */}
      <AlertDialog open={showAlreadySubmittedModal} onOpenChange={setShowAlreadySubmittedModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("booking.alreadySubmitted.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("booking.alreadySubmitted.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleGoToHome}>
              {t("booking.alreadySubmitted.goBack")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToContact}>
              {t("booking.alreadySubmitted.goToContact")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteShell>
  )
}
