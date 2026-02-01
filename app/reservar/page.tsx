"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { useCalendlyData } from "@/hooks/use-calendly-data"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "@/components/booking-calendar"
import Link from "next/link"
import { 
  Calendar,
  ArrowRight,
  Info
} from "lucide-react"

export default function ReservarPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { saveCalendlyData, hasCalendlyData } = useCalendlyData()

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
    
    // Redirigir a contacto después de agendar
    setTimeout(() => {
      router.push("/contacto")
    }, 1500)
  }, [router, saveCalendlyData])

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
                  <Calendar className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
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
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto">
            {/* Custom Booking Calendar */}
            <Reveal delay={200}>
              <div className="rounded-xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden mb-8 p-6">
                <BookingCalendar 
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </Reveal>

            {/* Info Box */}
            <Reveal delay={400}>
              <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">
                      {t("book.info.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("book.info.description")}
                    </p>
                    {hasCalendlyData && (
                      <div className="mt-4">
                        <Button asChild variant="outline">
                          <Link href="/contacto" className="flex items-center gap-2">
                            {t("common.continue")}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </SiteShell>
  )
}
