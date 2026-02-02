"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useTheme } from "next-themes"
import { useStagger } from "@/hooks/use-stagger"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { FrictionlessFlow } from "@/components/frictionless-flow"
import { Reveal } from "@/components/reveal"
import { ActiveSectionIndicator } from "@/components/active-section-indicator"
import { FloatingParticles } from "@/components/animations/floating-particles"
import { WaveLines } from "@/components/animations/wave-lines"
import { RotatingRings } from "@/components/animations/rotating-rings"
import { PulsingGrid } from "@/components/animations/pulsing-grid"
import { SpiralDots } from "@/components/animations/spiral-dots"
import { MeteorShower } from "@/components/animations/meteor-shower"
import {
  Calendar,
  Zap,
  TrendingUp,
  Heart,
  Target,
  Euro,
  Smile,
  Stethoscope,
  Building2,
  PawPrint,
  MessageCircle,
  Users,
  AlertCircle,
  Brain,
  Clock,
  BellRing
} from "lucide-react"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { AnimatedNumber } from "@/components/animated-number"
import { FinalCTA } from "@/components/final-cta"

// Lazy load canvas components
const ThreeBackdrop = dynamic(
  () => import("@/components/canvas/three-backdrop").then((mod) => mod.ThreeBackdrop),
  { ssr: false }
)

const P5NoiseBlob = dynamic(
  () => import("@/components/canvas/p5-noise-blob").then((mod) => mod.P5NoiseBlob),
  { ssr: false }
)

export default function Home() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { ref: systemFeaturesRef } = useStagger({ stagger: 100, duration: 600, distance: 40 })
  const { ref: benefitsRef } = useStagger({ stagger: 150, duration: 700, distance: 40 })
  const { ref: problemCardsRef } = useStagger({ stagger: 120, duration: 650, distance: 40 })
  
  // Hero mount animations
  const { ref: heroLogoRef } = useMountAnimation({ delay: 100, duration: 1000, distance: 40 })
  const { ref: heroTitleRef } = useMountAnimation({ delay: 300, duration: 1000, distance: 50 })
  const { ref: heroSubtitleRef } = useMountAnimation({ delay: 500, duration: 900, distance: 40 })
  const { ref: heroLinkRef } = useMountAnimation({ delay: 700, duration: 900, distance: 40 })
  const { ref: heroButtonsRef } = useMountAnimation({ delay: 900, duration: 800, distance: 30 })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"

  return (
    <SiteShell>
      <ActiveSectionIndicator />
      {/* Hero Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" id="hero" className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-white via-background to-card/50 dark:from-black dark:via-background dark:to-card/30 pb-0">
        {/* Animación: Partículas flotantes sutiles */}
        <FloatingParticles count={30} color="primary" size="sm" />
        <ThreeBackdrop />
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 py-8 2xl:py-12 3xl:py-16 text-center flex-1 flex items-center">
          <div className="max-w-4xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto space-y-6 2xl:space-y-10 3xl:space-y-8 w-full">
            <div ref={heroLogoRef as React.RefObject<HTMLDivElement>} className="hidden md:flex justify-center">
              <Logo 
                width={800} 
                height={200} 
                className="h-24 w-auto sm:h-32 md:h-36 lg:h-36 xl:h-40 2xl:h-60 3xl:h-64" 
              />
            </div>

            <h1 ref={heroTitleRef as React.RefObject<HTMLHeadingElement>} className="hero-title text-5xl font-bold tracking-tight sm:text-6xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-8xl gradient-text-slide">
              {t("home.hero.claim")}
            </h1>

            <p ref={heroSubtitleRef as React.RefObject<HTMLParagraphElement>} className="hero-subtitle mx-auto max-w-2xl 2xl:max-w-4xl 3xl:max-w-6xl text-xl font-medium text-foreground/90 dark:text-foreground/95 sm:text-2xl lg:text-lg xl:text-xl 2xl:text-3xl">
              {t("home.hero.keyMessage")}
            </p>

            <p ref={heroLinkRef as React.RefObject<HTMLParagraphElement>} className="hero-link mx-auto max-w-2xl 2xl:max-w-4xl 3xl:max-w-6xl text-base text-muted-foreground sm:text-lg lg:text-base xl:text-lg 2xl:text-3xl">
              <Link 
                href="/roi" 
                className="text-gradient-to dark:text-primary hover:underline transition-colors"
              >
                {t("home.hero.microCTA")}
              </Link>
            </p>

            <div ref={heroButtonsRef as React.RefObject<HTMLDivElement>} className="flex flex-col items-center gap-3 2xl:gap-4 sm:flex-row sm:justify-center pt-2 2xl:pt-4">
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto 2xl:text-lg 3xl:text-xl cursor-pointer">
                <Link href="/reservar">{t("home.hero.cta1")}</Link>
              </Button>
              <Button asChild size="lg" className="w-full sm:w-auto 2xl:text-lg 3xl:text-xl cursor-pointer dark:glow-primary">
                <Link href="/roi">{t("home.hero.cta2")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Visible en todas las pantallas */}
        <div className="relative z-10 pb-8">
          <ScrollIndicator targetId="problem-section" />
        </div>
      </Section>

      {/* Problem Section - Tema de PELIGRO/ALERTA con tonos rojos "INFIERNO" */}
      <Section variant="card" id="problem-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-b from-red-950/30 via-orange-950/20 to-red-950/30 dark:from-red-950/50 dark:via-orange-950/30 dark:to-red-950/50 relative overflow-hidden pb-0">
        {/* Animación: Partículas flotantes rojas - AGRESIVA */}
        <FloatingParticles count={60} color="red" size="lg" />
        
        {/* Resplandor rojo de fondo estilo infierno */}
        <div className="absolute inset-0 bg-gradient-radial from-red-600/20 via-transparent to-transparent dark:from-red-600/30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-red-500/10 to-transparent dark:from-red-500/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-600/10 to-transparent dark:from-orange-600/20 pointer-events-none" />
        
        <BlobShape position="top-left" color="primary" className="w-[500px] h-[500px] opacity-10" parallax parallaxSpeed={0.2} />
        <BlobShape position="bottom-right" color="accent" className="w-[600px] h-[600px] opacity-10" parallax parallaxSpeed={0.3} />
        <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8], [5, 10], [15, 6]]} />
        
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          {/* Header impactante */}
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-danger">
                {t("home.problem.title")}
              </h2>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400 sm:text-3xl">
                {t("home.problem.subtitle")}
              </p>
              <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl max-w-2xl mx-auto">
                {t("home.problem.description")}
              </p>
            </div>
          </Reveal>

          {/* Grid de problemas específicos - 2x2 */}
          <div ref={problemCardsRef as React.RefObject<HTMLDivElement>} className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-12">
            {/* Problema 1: Mensajes sin responder */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
              <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-3 md:pt-4">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                  {t("home.problem.issues.unanswered.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                  {t("home.problem.issues.unanswered.description")}
                </p>
              </div>
            </div>

            {/* Problema 2: Recepción saturada */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
              <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-3 md:pt-4">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                  {t("home.problem.issues.overload.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                  {t("home.problem.issues.overload.description")}
                </p>
              </div>
            </div>

            {/* Problema 3: Citas que se escapan */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
              <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-3 md:pt-4">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                  {t("home.problem.issues.missed.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                  {t("home.problem.issues.missed.description")}
                </p>
              </div>
            </div>

            {/* Problema 4: Agenda desorganizada */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
              <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-3 md:pt-4">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                  {t("home.problem.issues.chaos.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                  {t("home.problem.issues.chaos.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* System Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" id="system-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-b from-white via-background to-background dark:from-black dark:via-background dark:to-background pb-0">
        {/* Animación: Anillos rotatorios - AGRESIVA */}
        <RotatingRings count={6} />
        <CircuitLines />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
                {t("home.system.title")}
              </h2>
              <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl max-w-3xl mx-auto">
                {t("home.system.description")}
              </p>
            </div>
          </Reveal>

          <div ref={systemFeaturesRef as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-12">
            {/* Feature 1: Comprensión */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm">
                <Brain className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {t("home.system.features.understanding.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.system.features.understanding.description")}
              </p>
            </div>

            {/* Feature 2: Disponibilidad */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm">
                <Clock className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {t("home.system.features.availability.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.system.features.availability.description")}
              </p>
            </div>

            {/* Feature 3: Agenda */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm">
                <Calendar className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {t("home.system.features.booking.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.system.features.booking.description")}
              </p>
            </div>

            {/* Feature 4: Seguimiento */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm">
                <BellRing className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {t("home.system.features.followup.title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.system.features.followup.description")}
              </p>
            </div>
          </div>

          {/* Estadística impactante - Al final de la sección */}
          <Reveal delay={200} duration={900}>
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-8 md:p-8 text-center backdrop-blur-sm dark:glow-md pt-12 md:pt-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm shadow-lg dark:glow-primary whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis">
                  {t("home.problem.stat")}
                </div>
                <p className="text-base md:text-lg text-foreground font-medium">
                  {t("home.problem.description")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Flow Section - Flujo sin fricción con línea vertical animada */}
      <Section variant="muted" id="flow-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted pb-0">
        {/* Animación: Ondas fluidas - AGRESIVA */}
        <WaveLines count={12} />
        <P5NoiseBlob />
        <BlobShape position="bottom-right" color="accent" className="w-96 h-96" parallax parallaxSpeed={0.4} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 lg:mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-flow">
                {t("home.flow.title")}
              </h2>
              <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl">
                {t("home.flow.description")}
              </p>
            </div>
          </Reveal>

          <FrictionlessFlow />
        </div>
      </Section>

      {/* Benefits Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" id="benefits-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20 pb-0">
        {/* Animación: Grid pulsante */}
        <PulsingGrid />
        <GridPattern squares={[[2, 3], [5, 1], [8, 5], [12, 8], [15, 2], [10, 9]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-bounce">
                {t("home.benefits.title")}
              </h2>
              <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl">
                {t("home.benefits.description")}
              </p>
            </div>
          </Reveal>

          <div ref={benefitsRef as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Benefit 1: Disponibilidad */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm shrink-0">
                  <Zap className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient-to dark:text-primary">
                    {t("home.benefits.items.availability.title")}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t("home.benefits.items.availability.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit 2: Eficiencia */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm shrink-0">
                  <TrendingUp className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient-to dark:text-primary">
                    {t("home.benefits.items.efficiency.title")}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t("home.benefits.items.efficiency.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit 3: Experiencia */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm shrink-0">
                  <Heart className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient-to dark:text-primary">
                    {t("home.benefits.items.experience.title")}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t("home.benefits.items.experience.description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Benefit 4: Optimización */}
            <div data-stagger-item className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg  dark:glow-sm shrink-0">
                  <Target className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gradient-to dark:text-primary">
                    {t("home.benefits.items.optimization.title")}
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {t("home.benefits.items.optimization.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Scenarios Section - MÁS OSCURO en light, MÁS CLARO en dark */}
      <Section variant="card" id="scenarios-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 md:py-20 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted pb-0">
        {/* Animación: Espiral de puntos - VISIBLE */}
        <SpiralDots />
        <BlobShape position="top-right" color="gradient" parallax parallaxSpeed={0.25} />
        <BlobShape position="bottom-left" color="primary" className="w-80 h-80" parallax parallaxSpeed={0.35} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-shimmer">
              {t("home.scenarios.title")}
            </h2>
            <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
              {t("home.scenarios.description")}
            </p>
          </div>

          {/* Scenarios Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-10">
            {[
              { type: "dental", icon: Smile, color: "from-blue-500 via-purple-600 to-blue-600 dark:from-blue-500 dark:via-purple-500 dark:to-cyan-500" },
              { type: "medical", icon: Stethoscope, color: "from-blue-500 via-purple-600 to-blue-600 dark:from-green-500 dark:via-emerald-600 dark:to-emerald-500" },
              { type: "private", icon: Building2, color: "from-blue-500 via-purple-600 to-blue-600 dark:from-pink-500 dark:via-purple-500 dark:to-purple-600" },
              { type: "veterinary", icon: PawPrint, color: "from-blue-500 via-purple-600 to-blue-600 dark:from-orange-500 dark:via-amber-600 dark:to-amber-500" }
            ].map(({ type, icon: Icon, color }) => (
              <div 
                key={type} 
                className="group rounded-lg border-2 border-border bg-background/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
              >
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg dark:glow-sm`}>
                    <Icon className="w-7 h-7 text-white dark:text-black" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gradient-to dark:text-primary group-hover:text-primary transition-colors">
                  {t(`home.scenarios.types.${type}.title`)}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(`home.scenarios.types.${type}.description`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/escenarios">{t("home.scenarios.cta")}</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* ROI CTA Section */}
      <Section variant="muted" id="roi-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-br from-muted via-background to-muted dark:from-muted dark:via-background dark:to-muted pb-0">
        {/* Animación: Lluvia de meteoros */}
        <MeteorShower />
        <CircuitLines />
        <BlobShape position="center" color="accent" className="w-[500px] h-[500px]" parallax parallaxSpeed={0.3} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 xl:mb-6 2xl:mb-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-wave">
              {t("home.roi.title")}
            </h2>
            <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
              {t("home.roi.description")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-12">
            {["response", "lost", "revenue"].map((stat) => (
              <div 
                key={stat} 
                className="rounded-lg border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
              >
                <div className="text-5xl font-bold mb-3 text-gradient-to dark:text-primary sm:text-6xl">
                  <AnimatedNumber 
                    value={t(`home.roi.stats.${stat}.value`)} 
                    duration={2500}
                  />
                </div>
                <p className="text-sm text-foreground/70 dark:text-foreground/80 sm:text-base">
                  {t(`home.roi.stats.${stat}.label`)}
                </p>
              </div>
            ))}
          </div>

          {/* Impact Cards */}
          <div className="max-w-4xl mx-auto xl:mb-6 2xl:mb-12">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Economic Impact */}
              <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                    <Euro className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {t("home.roi.impact.economic.title")}
                    </h3>
                    <p className="text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed sm:text-base">
                      {t("home.roi.impact.economic.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Impact */}
              <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                    <Clock className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {t("home.roi.impact.time.title")}
                    </h3>
                    <p className="text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed sm:text-base">
                      {t("home.roi.impact.time.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA with description */}
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <p className="text-base text-foreground/80 dark:text-foreground/90 sm:text-lg">
              {t("home.roi.ctaDescription")}
            </p>
            <Button asChild size="lg" className="cursor-pointer dark:glow-primary text-base sm:text-lg px-8">
              <Link href="/roi">{t("home.roi.cta")}</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Final CTA Section - Visible with footer */}
      <Section variant="alt" id="final-cta-section" className="min-h-screen md:min-h-[calc(100vh-400px)] flex flex-col justify-center py-16 bg-gradient-to-br from-section-alt via-card to-section-alt dark:from-background dark:via-card/50 dark:to-background pb-0">
        <BlobShape position="center" color="primary" className="w-[500px] h-[500px] opacity-20" parallax parallaxSpeed={0.1} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <FinalCTA showMicroCta={true} />
        </div>
      </Section>
    </SiteShell>
  )
}
