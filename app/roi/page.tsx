"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { useROIData } from "@/hooks/use-roi-data"
import { useMounted } from "@/hooks/use-mounted"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { 
  TrendingUp, 
  Euro, 
  Clock, 
  Calculator,
  ArrowRight,
  Info,
  Send,
  ShieldCheck,
  AlertTriangle
} from "lucide-react"

export default function ROIPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { saveROIData, acceptROIData, clearROIData, roiData } = useROIData()
  const mounted = useMounted()
  const [showDialog, setShowDialog] = React.useState(false)
  const [showIncompleteDialog, setShowIncompleteDialog] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null)
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false)
  const [shouldBlockNavigation, setShouldBlockNavigation] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)
  
  // Inputs - Inicializados vacíos
  const [monthlyPatients, setMonthlyPatients] = React.useState(0)
  const [avgTicket, setAvgTicket] = React.useState(0)
  const [missedRate, setMissedRate] = React.useState(0)
  
  // Cargar datos existentes de ROI al montar el componente
  React.useEffect(() => {
    if (!isInitialized && roiData) {
      setMonthlyPatients(roiData.monthlyPatients)
      setAvgTicket(roiData.avgTicket)
      setMissedRate(roiData.missedRate)
      setHasUserInteracted(true) // Marcar como interactuado si ya hay datos
      setIsInitialized(true)
    }
  }, [roiData, isInitialized])
  
  // Outputs calculados
  const missedPatients = Math.round((monthlyPatients * missedRate) / 100)
  const recoveredPatients = Math.round(missedPatients * 0.70) // 70% de recuperación estimada
  const monthlyRevenue = recoveredPatients * avgTicket
  const yearlyRevenue = monthlyRevenue * 12
  const systemCost = 199 // Costo mensual estimado del sistema
  const roi = Math.round(((monthlyRevenue - systemCost) / systemCost) * 100)
  const breakEvenDays = systemCost > 0 ? Math.round((systemCost / (monthlyRevenue / 30))) : 0

  const { ref: calculatorRef } = useMountAnimation({ delay: 300, duration: 1000 })
  const { ref: resultsRef } = useMountAnimation({ delay: 600, duration: 1000 })

  // Verificar si los datos están completos
  const isDataComplete = React.useCallback(() => {
    return monthlyPatients > 0 && avgTicket > 0 && missedRate > 0
  }, [monthlyPatients, avgTicket, missedRate])

  // Interceptar navegación y mostrar dialog
  React.useEffect(() => {
    // Interceptar clicks en links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.includes('/roi')) {
        // Si hay datos sin aceptar, prevenir navegación y mostrar dialog
        if (shouldBlockNavigation && hasUserInteracted && !roiData?.accepted) {
          e.preventDefault()
          e.stopPropagation()
          setPendingNavigation(link.href)
          
          // Verificar si los datos están completos
          const dataComplete = monthlyPatients > 0 && avgTicket > 0 && missedRate > 0
          if (!dataComplete) {
            setShowIncompleteDialog(true)
          } else {
            setShowDialog(true)
          }
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [hasUserInteracted, monthlyPatients, avgTicket, missedRate, roiData, shouldBlockNavigation])

  // Save ROI data whenever inputs change (only if user has data)
  React.useEffect(() => {
    if (hasUserInteracted && (monthlyPatients > 0 || avgTicket > 0 || missedRate > 0)) {
      saveROIData({
        monthlyPatients,
        avgTicket,
        missedRate,
        monthlyRevenue,
        yearlyRevenue,
        roi,
        breakEvenDays,
        timestamp: Date.now(),
      }, true) // Skip acceptance flag during auto-save
    }
  }, [monthlyPatients, avgTicket, missedRate, hasUserInteracted, saveROIData, monthlyRevenue, yearlyRevenue, roi, breakEvenDays])

  // Handle navigation with confirmation
  const handleNavigateWithConfirmation = (href: string) => {
    // Si no ha interactuado, navegar directamente
    if (!hasUserInteracted) {
      router.push(href)
      return
    }
    
    // Si ha interactuado pero los datos están incompletos
    if (!isDataComplete()) {
      setPendingNavigation(href)
      setShowIncompleteDialog(true)
      return
    }
    
    // Si los datos están completos, mostrar dialog de aceptación
    setPendingNavigation(href)
    setShowDialog(true)
  }
  
  // Wrapper functions to track user interaction
  const handleMonthlyPatientsChange = (value: number) => {
    setHasUserInteracted(true)
    setMonthlyPatients(value)
  }
  
  const handleAvgTicketChange = (value: number) => {
    setHasUserInteracted(true)
    setAvgTicket(value)
  }
  
  const handleMissedRateChange = (value: number) => {
    setHasUserInteracted(true)
    setMissedRate(value)
  }
  
  const handlePresetClick = (patients: number, ticket: number, missed: number) => {
    setHasUserInteracted(true)
    setMonthlyPatients(patients)
    setAvgTicket(ticket)
    setMissedRate(missed)
  }

  const handleAccept = () => {
    acceptROIData()
    setShouldBlockNavigation(false)
    setShowDialog(false)
    
    // Esperar un momento para que se actualice el estado antes de navegar
    setTimeout(() => {
      if (pendingNavigation) {
        window.location.href = pendingNavigation
      }
    }, 100)
  }

  const handleCancel = () => {
    clearROIData()
    setShouldBlockNavigation(false)
    setShowDialog(false)
    
    // Esperar un momento para que se actualice el estado antes de navegar
    setTimeout(() => {
      if (pendingNavigation) {
        window.location.href = pendingNavigation
      }
    }, 100)
  }

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
                  <Calculator className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("roi.calculator.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("roi.calculator.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Explanation Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={200}>
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Qué es ROI */}
                <div className="rounded-xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {t("roi.calculator.whatIsROI.title")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("roi.calculator.whatIsROI.description")}
                  </p>
                </div>

                {/* Qué es esta calculadora */}
                <div className="rounded-xl border-2 border-primary/20 bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    {t("roi.calculator.whatIsCalculator.title")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("roi.calculator.whatIsCalculator.description")}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Calculator Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted">
        <BlobShape position="bottom-right" color="accent" parallax parallaxSpeed={0.3} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Inputs */}
            <div ref={calculatorRef as React.RefObject<HTMLDivElement>} className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                {t("roi.calculator.inputs.title")}
              </h2>
              
              <div className="space-y-6">
                {/* Pacientes mensuales */}
                <div className="space-y-2">
                  <Label htmlFor="monthly-patients" className="text-base font-medium">
                    {t("roi.calculator.inputs.monthlyPatients.label")}
                  </Label>
                  <Input
                    id="monthly-patients"
                    type="number"
                    value={monthlyPatients}
                    onChange={(e) => handleMonthlyPatientsChange(Number(e.target.value))}
                    className="text-lg"
                    min="0"
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.inputs.monthlyPatients.help")}
                  </p>
                </div>

                {/* Ticket promedio */}
                <div className="space-y-2">
                  <Label htmlFor="avg-ticket" className="text-base font-medium">
                    {t("roi.calculator.inputs.avgTicket.label")}
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="avg-ticket"
                      type="number"
                      value={avgTicket}
                      onChange={(e) => handleAvgTicketChange(Number(e.target.value))}
                      className="text-lg pl-10"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.inputs.avgTicket.help")}
                  </p>
                </div>

                {/* Porcentaje perdido */}
                <div className="space-y-2">
                  <Label htmlFor="missed-rate" className="text-base font-medium">
                    {t("roi.calculator.inputs.missedRate.label")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="missed-rate"
                      type="number"
                      value={missedRate}
                      onChange={(e) => handleMissedRateChange(Number(e.target.value))}
                      className="text-lg"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.inputs.missedRate.help")}
                  </p>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="mt-6 p-3 sm:p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <p className="text-xs sm:text-sm font-medium text-foreground mb-3">
                  {t("roi.calculator.inputs.presets.title")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(150, 100, 25)}
                    className="text-xs sm:text-sm cursor-pointer transition-colors hover:border-primary"
                  >
                    {t("roi.calculator.inputs.presets.small")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(300, 180, 35)}
                    className="text-xs sm:text-sm cursor-pointer transition-colors hover:border-primary"
                  >
                    {t("roi.calculator.inputs.presets.medium")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetClick(500, 250, 40)}
                    className="text-xs sm:text-sm cursor-pointer transition-colors hover:border-primary"
                  >
                    {t("roi.calculator.inputs.presets.large")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearROIData()
                      setMonthlyPatients(0)
                      setAvgTicket(0)
                      setMissedRate(0)
                      setHasUserInteracted(false)
                      setIsInitialized(true) // Prevent reload from localStorage
                    }}
                    className="text-xs sm:text-sm cursor-pointer transition-colors hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    {t("roi.calculator.inputs.presets.clear")}
                  </Button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-foreground/70">
                  <Info className="w-4 h-4 inline mr-2 text-gradient-to dark:text-primary" />
                  {t("roi.calculator.disclaimer")}
                </p>
              </div>
            </div>

            {/* Results */}
            <div ref={resultsRef as React.RefObject<HTMLDivElement>} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                {t("roi.calculator.results.title")}
              </h2>

              {/* Ingresos recuperables */}
              <div className="rounded-xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-6 backdrop-blur-sm transition-all hover:shadow-2xl dark:hover:shadow-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("roi.calculator.results.monthlyRevenue")}
                  </p>
                  <Euro className="w-5 h-5 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary mb-1">
                  {!hasUserInteracted ? '-' : (mounted ? `${monthlyRevenue.toLocaleString()}€` : `${monthlyRevenue}€`)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("roi.calculator.results.yearlyRevenue")}: {!hasUserInteracted ? '-' : (mounted ? `${yearlyRevenue.toLocaleString()}€` : `${yearlyRevenue}€`)}
                </p>
              </div>

              {/* ROI */}
              <div className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("roi.calculator.results.roi")}
                  </p>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground mb-1">
                  {!hasUserInteracted ? '-' : `${roi > 0 ? '+' : ''}${roi}%`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("roi.calculator.results.roiHelp")}
                </p>
              </div>

              {/* Punto de equilibrio */}
              <div className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("roi.calculator.results.breakEven")}
                  </p>
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-4xl font-bold text-foreground mb-1">
                  {!hasUserInteracted ? '-' : `${breakEvenDays} ${t("roi.calculator.results.days")}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("roi.calculator.results.breakEvenHelp")}
                </p>
              </div>

              {/* Desglose */}
              <div className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                <h3 className="text-base font-semibold mb-4 text-foreground">
                  {t("roi.calculator.results.breakdown")}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("roi.calculator.results.missedPatients")}</span>
                    <span className="font-medium text-foreground">{!hasUserInteracted ? '-' : missedPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("roi.calculator.results.recoveredPatients")}</span>
                    <span className="font-medium text-primary">{!hasUserInteracted ? '-' : recoveredPatients}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-muted-foreground">{t("roi.calculator.results.recoveryRate")}</span>
                    <span className="font-medium text-foreground">{!hasUserInteracted ? '-' : '70%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Reveal delay={900}>
            <div className="max-w-3xl mx-auto mt-12 text-center">
              <div className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {t("roi.calculator.cta.title")}
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t("roi.calculator.cta.description")}
                </p>
                <Button 
                  onClick={() => handleNavigateWithConfirmation("/contacto")}
                  size="lg" 
                  className="dark:glow-primary cursor-pointer"
                >
                  {t("roi.calculator.cta.button")}
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent size="lg">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldCheck className="text-primary" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-xl">
              {t("roi.dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t("roi.dialog.description").split(/(NeuronIA|IA)/g).map((part, index) => {
                if (part === "NeuronIA" || part === "IA") {
                  return <span key={index} className="gradient-text-pulse font-semibold">{part}</span>
                }
                return part
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t("roi.dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>
              {t("roi.dialog.accept")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Incomplete Data Dialog */}
      <AlertDialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
        <AlertDialogContent size="lg">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-red-500/10 dark:bg-red-500/20">
              <AlertTriangle className="text-red-600 dark:text-red-500" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-red-600 dark:text-red-500 text-xl">
              {t("roi.dialog.incomplete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-red-600/80 dark:text-red-500/80 text-base">
              {t("roi.dialog.incomplete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowIncompleteDialog(false)
                setPendingNavigation(null)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("roi.dialog.incomplete.button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteShell>
  )
}
