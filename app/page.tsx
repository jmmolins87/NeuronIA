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
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { 
  MessageCircle, 
  AlertCircle, 
  Brain, 
  Clock, 
  Calendar, 
  BellRing,
  Zap,
  Users,
  Target,
  TrendingUp,
  Stethoscope,
  Building2,
  UserSquare2,
  Heart,
  ArrowRight
} from "lucide-react"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { AnimatedNumber } from "@/components/animated-number"

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

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"

  return (
    <SiteShell>
      {/* Hero Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" id="hero" className="relative min-h-[calc(100svh-4rem)] flex flex-col items-center bg-gradient-to-b from-white via-background to-card/50 dark:from-black dark:via-background dark:to-card/30">
        <ThreeBackdrop />
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 py-4 text-center flex-1 flex items-center sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto w-full min-h-[56svh] space-y-5 sm:min-h-[60svh] sm:space-y-7 lg:min-h-[64svh]">
            <div className="hidden justify-center sm:flex">
              <Logo 
                width={800} 
                height={200} 
                className="h-20 w-auto sm:h-24 md:h-28 lg:h-36 xl:h-48 2xl:h-64" 
              />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl md:whitespace-nowrap xl:text-6xl 2xl:text-7xl gradient-text-slide hero-title">
              {t("home.hero.claim")}
            </h1>

            <p className="mx-auto max-w-2xl text-base font-medium text-foreground sm:text-lg md:text-xl xl:text-2xl">
              {t("home.hero.keyMessage")}
            </p>

            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg xl:text-xl">
              <Link 
                href="/roi" 
                className="text-gradient-to dark:text-primary hover:underline transition-colors"
              >
                {t("home.hero.microCTA")}
              </Link>
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center pt-2 sm:pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/reservar">{t("home.hero.cta1")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/roi">{t("home.hero.cta2")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="problem-section" />
        </div>
      </Section>

      {/* Problem Section - alarma neón en rojo */}
      <Section
        variant="card"
        id="problem-section"
        className="py-32 bg-gradient-to-b from-destructive/8 via-destructive/5 to-card dark:from-destructive/12 dark:via-destructive/8 dark:to-card"
      >
        <BlobShape position="top-left" color="primary" className="w-[500px] h-[500px]" />
        <BlobShape position="bottom-right" color="accent" className="w-[600px] h-[600px]" />
        <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8], [5, 10], [15, 6]]} />
        
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          {/* Header impactante */}
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-wave">
              {t("home.problem.title")}
            </h2>
            <p className="text-2xl font-semibold text-destructive sm:text-3xl">
              {t("home.problem.subtitle")}
            </p>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              {t("home.problem.description")}
            </p>
          </div>

          {/* Grid de problemas específicos - 2x2 */}
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-12">
            {/* Problema 1: Mensajes sin responder */}
            <div className="group relative rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:scale-105 hover:shadow-[0_0_25px_oklch(var(--destructive)/0.35)]">
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)]">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-bold text-destructive sm:text-2xl">
                  {t("home.problem.issues.unanswered.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.problem.issues.unanswered.description")}
                </p>
              </div>
            </div>

            {/* Problema 2: Recepción saturada */}
            <div className="group relative rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:scale-105 hover:shadow-[0_0_25px_oklch(var(--destructive)/0.35)]">
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)]">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-bold text-destructive sm:text-2xl">
                  {t("home.problem.issues.overload.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.problem.issues.overload.description")}
                </p>
              </div>
            </div>

            {/* Problema 3: Citas que se escapan */}
            <div className="group relative rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:scale-105 hover:shadow-[0_0_25px_oklch(var(--destructive)/0.35)]">
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)]">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-bold text-destructive sm:text-2xl">
                  {t("home.problem.issues.missed.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.problem.issues.missed.description")}
                </p>
              </div>
            </div>

            {/* Problema 4: Agenda desorganizada */}
            <div className="group relative rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:scale-105 hover:shadow-[0_0_25px_oklch(var(--destructive)/0.35)]">
              <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)]">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-3 pt-4">
                <h3 className="text-xl font-bold text-destructive sm:text-2xl">
                  {t("home.problem.issues.chaos.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.problem.issues.chaos.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Estadística impactante */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-8 text-center backdrop-blur-sm dark:glow-md">
              <div className="static mb-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg sm:absolute sm:-top-4 sm:left-1/2 sm:mb-0 sm:-translate-x-1/2 dark:glow-primary">
                {t("home.problem.stat")}
              </div>
              <p className="text-lg font-medium text-foreground sm:pt-4">
                {t("home.problem.description")}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* System Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" className="py-32 bg-gradient-to-b from-white via-background to-background dark:from-black dark:via-background dark:to-background">
        <CircuitLines />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
              {t("home.system.title")}
            </h2>
            <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
              {t("home.system.description")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Feature 1: Comprensión */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm">
                <Brain className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {t("home.system.features.understanding")}
              </p>
            </div>

            {/* Feature 2: Disponibilidad */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm">
                <Clock className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {t("home.system.features.availability")}
              </p>
            </div>

            {/* Feature 3: Agenda */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {t("home.system.features.booking")}
              </p>
            </div>

            {/* Feature 4: Seguimiento */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm">
                <BellRing className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {t("home.system.features.followup")}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Flow Section - MÁS OSCURO en light, MÁS CLARO en dark */}
      <Section variant="muted" className="py-32 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted">
        <P5NoiseBlob />
        <BlobShape position="bottom-right" color="accent" className="w-96 h-96" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-flow">
              {t("home.flow.title")}
            </h2>
            <p className="text-xl text-muted-foreground sm:text-2xl">
              {t("home.flow.description")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                1
              </div>
              <div className="pt-8 text-center space-y-3">
                <MessageCircle className="w-10 h-10 mx-auto text-primary" />
                <p className="text-base font-medium text-foreground">
                  {t("home.flow.steps.1")}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                2
              </div>
              <div className="pt-8 text-center space-y-3">
                <Clock className="w-10 h-10 mx-auto text-primary" />
                <p className="text-base font-medium text-foreground">
                  {t("home.flow.steps.2")}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                3
              </div>
              <div className="pt-8 text-center space-y-3">
                <Target className="w-10 h-10 mx-auto text-primary" />
                <p className="text-base font-medium text-foreground">
                  {t("home.flow.steps.3")}
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                4
              </div>
              <div className="pt-8 text-center space-y-3">
                <Calendar className="w-10 h-10 mx-auto text-primary" />
                <p className="text-base font-medium text-foreground">
                  {t("home.flow.steps.4")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Benefits Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section variant="default" className="py-32 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20">
        <GridPattern squares={[[2, 3], [5, 1], [8, 5], [12, 8], [15, 2], [10, 9]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-bounce">
              {t("home.benefits.title")}
            </h2>
            <p className="text-xl text-muted-foreground sm:text-2xl">
              {t("home.benefits.description")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Benefit 1: Disponibilidad */}
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm shrink-0">
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
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm shrink-0">
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
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm shrink-0">
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
            <div className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-lg">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:glow-sm shrink-0">
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
      <Section variant="card" className="py-24 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted">
        <BlobShape position="top-right" color="gradient" />
        <BlobShape position="bottom-left" color="primary" className="w-80 h-80" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
              {t("home.scenarios.title")}
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              {t("home.scenarios.description")}
            </p>
          </div>

          {/* Scenarios Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-10">
            {["dental", "medical", "private", "veterinary"].map((type) => (
              <div 
                key={type} 
                className="group rounded-lg border border-border bg-background/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-lg hover:scale-105 dark:hover:glow-sm"
              >
                <h3 className="text-lg font-semibold mb-2 text-gradient-to dark:text-primary group-hover:text-primary transition-colors">
                  {t(`home.scenarios.types.${type}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
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
      <Section variant="muted" className="py-24 bg-gradient-to-br from-muted via-background to-muted dark:from-muted dark:via-background dark:to-muted">
        <CircuitLines />
        <BlobShape position="center" color="accent" className="w-[500px] h-[500px]" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
              {t("home.roi.title")}
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              {t("home.roi.description")}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-10">
            {["response", "lost", "revenue"].map((stat) => (
              <div 
                key={stat} 
                className="rounded-lg border-2 border-border bg-card/80 backdrop-blur-sm p-8 text-center transition-all hover:border-primary hover:scale-105 dark:hover:glow-md"
              >
                <div className="text-5xl font-bold mb-3 text-gradient-to dark:text-primary sm:text-6xl">
                  <AnimatedNumber 
                    value={t(`home.roi.stats.${stat}.value`)} 
                    duration={2500}
                  />
                </div>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {t(`home.roi.stats.${stat}.label`)}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="dark:glow-primary">
              <Link href="/roi">{t("home.roi.cta")}</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section variant="alt" className="py-32 bg-gradient-to-br from-section-alt via-card to-section-alt dark:from-background dark:via-card/50 dark:to-background">
        <BlobShape position="center" color="primary" className="w-[600px] h-[600px]" />
        <BlobShape position="top-left" color="accent" className="w-[400px] h-[400px]" />
        <BlobShape position="bottom-right" color="gradient" className="w-[500px] h-[500px]" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
              {t("home.finalCTA.title")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("home.finalCTA.description")}
            </p>
            <div className="pt-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/reservar">{t("home.finalCTA.cta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </SiteShell>
  )
}
