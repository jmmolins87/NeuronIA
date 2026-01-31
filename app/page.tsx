"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  AlertCircle,
  BellRing,
  Brain,
  Calendar,
  Clock,
  Heart,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { AnimatedNumber } from "@/components/animated-number"
import { AppointmentLottie } from "@/components/lottie/appointment-lottie"
import { Logo } from "@/components/logo"
import { useTranslation } from "@/components/providers/i18n-provider"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Section } from "@/components/section"
import { AuroraField } from "@/components/shapes/aurora-field"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { SiteShell } from "@/components/site-shell"
import { AnimatedLink } from "@/components/ui/animated-link"
import { Button } from "@/components/ui/button"
import { NeonButton } from "@/components/ui/neon-button"
import { NeonCard, NeonCardIcon } from "@/components/ui/neon-card"

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
      <Section
        variant="default"
        id="hero"
        className="relative min-h-[calc(100svh-4rem)] flex flex-col items-center bg-gradient-to-b from-white via-background to-card/50 dark:from-black dark:via-background dark:to-card/30"
      >
        <AuroraField intensity="strong" className="opacity-70" />
        <GridPattern squares={[[2, 4], [7, 3], [10, 6], [15, 2]]} className="opacity-35" />
        <BlobShape position="top-left" color="gradient" className="w-[520px] h-[520px]" />
        <BlobShape position="bottom-right" color="accent" className="w-[620px] h-[620px]" />
        <ThreeBackdrop />
          <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 pt-4 pb-24 text-center flex-1 flex items-center sm:pt-6 sm:pb-28 lg:pt-8 lg:pb-32">
          <div className="max-w-4xl mx-auto w-full min-h-[56svh] space-y-4 sm:min-h-[60svh] sm:space-y-5 lg:min-h-[64svh] lg:space-y-3">
            <div className="hidden justify-center sm:flex">
              <Logo 
                width={800} 
                height={200} 
                className="h-20 w-auto sm:h-24 md:h-28 lg:h-36 xl:h-48 2xl:h-64" 
              />
            </div>

            <h1 className="pb-1 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-4xl xl:text-6xl 2xl:text-7xl gradient-text-slide hero-title">
              {t("home.hero.claim")}
            </h1>

            <p className="mx-auto max-w-2xl text-base font-medium text-foreground sm:text-lg md:text-xl xl:text-2xl">
              {t("home.hero.keyMessage")}
            </p>

            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg xl:text-xl">
              <AnimatedLink
                href="/roi"
                className="text-gradient-to dark:text-primary"
              >
                {t("home.hero.microCTA")}
              </AnimatedLink>
            </p>

            <div className="flex items-center justify-center mt-1 lg:mt-0">
              <AppointmentLottie size="sm" className="text-primary" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center pt-1 sm:pt-2 lg:pt-1">
              <NeonButton asChild size="lg" className="w-full sm:w-auto">
                <Link href="/reservar">{t("home.hero.cta1")}</Link>
              </NeonButton>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/roi">{t("home.hero.cta2")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="problem" showOnMobile />
        </div>
      </Section>

      {/* Problem Section - alarma neón en rojo */}
      <Section
        variant="card"
        id="problem"
        className="min-h-[100svh] py-32 overflow-visible bg-gradient-to-b from-destructive/8 via-destructive/5 to-card dark:from-destructive/12 dark:via-destructive/8 dark:to-card"
      >
        <AuroraField intensity="soft" className="opacity-40" />
        <CircuitLines className="opacity-35" />
        <BlobShape position="top-left" color="primary" className="w-[500px] h-[500px]" />
        <BlobShape position="bottom-right" color="accent" className="w-[600px] h-[600px]" />
        <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8], [5, 10], [15, 6]]} />
        
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          {/* Header impactante */}
          <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
            <h2 className="relative z-30 pb-1 text-4xl font-bold leading-[1.05] tracking-tight text-destructive drop-shadow-[0_10px_25px_oklch(var(--destructive)/0.35)] sm:text-5xl md:text-6xl lg:text-7xl gradient-text-alert">
              {t("home.problem.title")}
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl lg:max-w-3xl mx-auto">
              {t("home.problem.subtitle")}.
              <br />
              {t("home.problem.description")}
            </p>
          </div>

          {/* Grid de problemas específicos - 2x2 */}
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-12">
            {/* Problema 1: Mensajes sin responder */}
            <ScrollReveal delay={0}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:shadow-[0_18px_45px_oklch(var(--destructive)/0.65),0_0_32px_oklch(var(--destructive)/0.55)] dark:hover:shadow-[0_22px_60px_oklch(var(--destructive)/0.75),0_0_40px_oklch(var(--destructive)/0.65)]">
                <div className="absolute left-4 top-4 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)] sm:-left-5 sm:-top-5">
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
            </ScrollReveal>

            {/* Problema 2: Recepción saturada */}
            <ScrollReveal delay={100}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:shadow-[0_18px_45px_oklch(var(--destructive)/0.65),0_0_32px_oklch(var(--destructive)/0.55)] dark:hover:shadow-[0_22px_60px_oklch(var(--destructive)/0.75),0_0_40px_oklch(var(--destructive)/0.65)]">
                <div className="absolute left-4 top-4 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)] sm:-left-5 sm:-top-5">
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
            </ScrollReveal>

            {/* Problema 3: Citas que se escapan */}
            <ScrollReveal delay={200}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:shadow-[0_18px_45px_oklch(var(--destructive)/0.65),0_0_32px_oklch(var(--destructive)/0.55)] dark:hover:shadow-[0_22px_60px_oklch(var(--destructive)/0.75),0_0_40px_oklch(var(--destructive)/0.65)]">
                <div className="absolute left-4 top-4 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)] sm:-left-5 sm:-top-5">
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
            </ScrollReveal>

            {/* Problema 4: Agenda desorganizada */}
            <ScrollReveal delay={300}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-destructive/40 bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-destructive hover:shadow-[0_18px_45px_oklch(var(--destructive)/0.65),0_0_32px_oklch(var(--destructive)/0.55)] dark:hover:shadow-[0_22px_60px_oklch(var(--destructive)/0.75),0_0_40px_oklch(var(--destructive)/0.65)]">
                <div className="absolute left-4 top-4 w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_oklch(var(--destructive)/0.45)] sm:-left-5 sm:-top-5">
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
            </ScrollReveal>
          </div>

          {/* Estadística impactante */}
          <ScrollReveal delay={100}>
            <div className="max-w-3xl mx-auto">
              <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-8 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_45px_oklch(var(--glow)/0.2)] dark:hover:shadow-[0_22px_55px_oklch(var(--glow)/0.3)]">
                <div className="static mb-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg sm:absolute sm:-top-4 sm:left-1/2 sm:mb-0 sm:-translate-x-1/2 dark:glow-primary">
                  {t("home.problem.stat")}
                </div>
                <p className="text-lg font-medium text-foreground sm:pt-4">
                  {t("home.problem.description")}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="system" />
        </div>
      </Section>

      {/* System Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section
        variant="default"
        id="system"
        className="min-h-[100svh] py-32 overflow-visible bg-gradient-to-b from-white via-background to-background dark:from-black dark:via-background dark:to-background"
      >
        <AuroraField intensity="medium" className="opacity-55" />
        <CircuitLines />
        <GridPattern squares={[[2, 1], [6, 4], [9, 7], [13, 2], [17, 6]]} className="opacity-35" />
        <BlobShape position="top-right" color="gradient" className="w-[520px] h-[520px]" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="pb-1 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
                {t("home.system.title")}
              </h2>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("home.system.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
            {/* Feature 1: Comprension */}
            <ScrollReveal delay={0}>
              <NeonCard className="h-full p-8 text-center">
                <NeonCardIcon className="mx-auto mb-6 size-16 dark:glow-sm">
                  <Brain className="size-8 text-primary-foreground" />
                </NeonCardIcon>
                <p className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t("home.system.features.understanding")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("home.system.featureDescriptions.understanding")}
                </p>
              </NeonCard>
            </ScrollReveal>

            {/* Feature 2: Disponibilidad */}
            <ScrollReveal delay={100}>
              <NeonCard className="h-full p-8 text-center">
                <NeonCardIcon className="mx-auto mb-6 size-16 dark:glow-sm">
                  <Clock className="size-8 text-primary-foreground" />
                </NeonCardIcon>
                <p className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t("home.system.features.availability")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("home.system.featureDescriptions.availability")}
                </p>
              </NeonCard>
            </ScrollReveal>

            {/* Feature 3: Agenda */}
            <ScrollReveal delay={200}>
              <NeonCard className="h-full p-8 text-center">
                <NeonCardIcon className="mx-auto mb-6 size-16 dark:glow-sm">
                  <Calendar className="size-8 text-primary-foreground" />
                </NeonCardIcon>
                <p className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t("home.system.features.booking")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("home.system.featureDescriptions.booking")}
                </p>
              </NeonCard>
            </ScrollReveal>

            {/* Feature 4: Seguimiento */}
            <ScrollReveal delay={300}>
              <NeonCard className="h-full p-8 text-center">
                <NeonCardIcon className="mx-auto mb-6 size-16 dark:glow-sm">
                  <BellRing className="size-8 text-primary-foreground" />
                </NeonCardIcon>
                <p className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {t("home.system.features.followup")}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("home.system.featureDescriptions.followup")}
                </p>
              </NeonCard>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="flow" />
        </div>
      </Section>

      {/* Flow Section - MÁS OSCURO en light, MÁS CLARO en dark */}
      <Section
        variant="muted"
        id="flow"
        className="min-h-[100svh] py-32 overflow-visible bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted"
      >
        <AuroraField intensity="medium" className="opacity-55" />
        <P5NoiseBlob />
        <GridPattern squares={[[1, 2], [4, 6], [8, 2], [12, 7], [16, 3]]} className="opacity-35" />
        <BlobShape position="bottom-right" color="accent" className="w-96 h-96" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="pb-1 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl gradient-text-flow">
                {t("home.flow.title")}
              </h2>
              <p className="text-xl text-muted-foreground sm:text-2xl">
                {t("home.flow.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
            {/* Step 1 */}
            <ScrollReveal delay={0}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_18px_45px_oklch(var(--border)/0.8),0_0_24px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_22px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
                <div className="absolute -top-4 left-4 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                  1
                </div>
                <div className="pt-8 text-center space-y-3">
                  <MessageCircle className="size-12 mx-auto text-primary" />
                  <p className="text-base font-medium text-foreground">
                    {t("home.flow.steps.1")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("home.flow.stepDescriptions.1")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal delay={100}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_18px_45px_oklch(var(--border)/0.8),0_0_24px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_22px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
                <div className="absolute -top-4 left-4 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                  2
                </div>
                <div className="pt-8 text-center space-y-3">
                  <Clock className="size-12 mx-auto text-primary" />
                  <p className="text-base font-medium text-foreground">
                    {t("home.flow.steps.2")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("home.flow.stepDescriptions.2")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal delay={200}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_18px_45px_oklch(var(--border)/0.8),0_0_24px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_22px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
                <div className="absolute -top-4 left-4 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                  3
                </div>
                <div className="pt-8 text-center space-y-3">
                  <Target className="size-12 mx-auto text-primary" />
                  <p className="text-base font-medium text-foreground">
                    {t("home.flow.steps.3")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("home.flow.stepDescriptions.3")}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Step 4 */}
            <ScrollReveal delay={300}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_18px_45px_oklch(var(--border)/0.8),0_0_24px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_22px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
                <div className="absolute -top-4 left-4 w-12 h-12 rounded-full bg-gradient-to dark:bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg group-hover:scale-110 transition-transform dark:glow-primary">
                  4
                </div>
                <div className="pt-8 text-center space-y-3">
                  <Calendar className="size-12 mx-auto text-primary" />
                  <p className="text-base font-medium text-foreground">
                    {t("home.flow.steps.4")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("home.flow.stepDescriptions.4")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="benefits" />
        </div>
      </Section>

      {/* Benefits Section - MUY CLARO en light, MUY OSCURO en dark */}
      <Section
        variant="default"
        id="benefits"
        className="min-h-[100svh] py-32 overflow-visible bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <AuroraField intensity="medium" className="opacity-55" />
        <GridPattern squares={[[2, 3], [5, 1], [8, 5], [12, 8], [15, 2], [10, 9]]} />
        <BlobShape position="top-left" color="gradient" className="w-[520px] h-[520px]" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
              <h2 className="pb-1 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl gradient-text-bounce">
                {t("home.benefits.title")}
              </h2>
              <p className="text-xl text-muted-foreground sm:text-2xl">
                {t("home.benefits.description")}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Benefit 1: Disponibilidad */}
            <ScrollReveal delay={0}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_20px_45px_oklch(var(--border)/0.8),0_0_26px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_24px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
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
            </ScrollReveal>

            {/* Benefit 2: Eficiencia */}
            <ScrollReveal delay={100}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_20px_45px_oklch(var(--border)/0.8),0_0_26px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_24px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
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
            </ScrollReveal>

            {/* Benefit 3: Experiencia */}
            <ScrollReveal delay={200}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_20px_45px_oklch(var(--border)/0.8),0_0_26px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_24px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
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
            </ScrollReveal>

            {/* Benefit 4: Optimizacion */}
            <ScrollReveal delay={300}>
              <div className="group relative z-10 h-full rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-[0_20px_45px_oklch(var(--border)/0.8),0_0_26px_oklch(var(--border)/0.6)] dark:hover:shadow-[0_24px_60px_oklch(var(--border)/0.75),0_0_32px_oklch(var(--border)/0.65)]">
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
            </ScrollReveal>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            <NeonCard className="h-full p-6">
              <div className="flex items-start gap-4">
                <NeonCardIcon className="size-12 shrink-0">
                  <TrendingUp className="size-6 text-primary-foreground" />
                </NeonCardIcon>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("home.benefits.support.title")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("home.benefits.support.description")}
                  </p>
                </div>
              </div>
            </NeonCard>
            <NeonCard className="h-full p-6">
              <div className="flex items-start gap-4">
                <NeonCardIcon className="size-12 shrink-0">
                  <Target className="size-6 text-primary-foreground" />
                </NeonCardIcon>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("home.benefits.support.secondaryTitle")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("home.benefits.support.secondaryDescription")}
                  </p>
                </div>
              </div>
            </NeonCard>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="scenarios" />
        </div>
      </Section>

      {/* Scenarios Section - MÁS OSCURO en light, MÁS CLARO en dark */}
      <Section
        variant="card"
        id="scenarios"
        className="min-h-[100svh] py-24 overflow-visible bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted"
      >
        <AuroraField intensity="medium" className="opacity-60" />
        <BlobShape position="top-right" color="gradient" />
        <BlobShape position="bottom-left" color="primary" className="w-80 h-80" />
        <GridPattern squares={[[2, 2], [6, 5], [9, 1], [13, 6]]} className="opacity-35" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
              <h2 className="pb-1 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
                {t("home.scenarios.title")}
              </h2>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {t("home.scenarios.description")}
              </p>
            </div>
          </ScrollReveal>

          {/* Scenarios Grid */}
          <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto mb-10">
            {["dental", "medical", "private", "veterinary"].map((type, index) => (
              <ScrollReveal key={type} delay={(index * 100) as 0 | 100 | 200 | 300}>
                <NeonCard className="h-full rounded-lg bg-background/50 p-6 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gradient-to transition-colors group-hover:text-primary dark:text-primary">
                    {t(`home.scenarios.types.${type}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`home.scenarios.types.${type}.description`)}
                  </p>
                </NeonCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/escenarios">{t("home.scenarios.cta")}</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="roi" />
        </div>
      </Section>

      {/* ROI CTA Section */}
      <Section
        variant="muted"
        id="roi"
        className="min-h-[100svh] py-24 overflow-visible bg-gradient-to-br from-muted via-background to-muted dark:from-muted dark:via-background dark:to-muted"
      >
        <AuroraField intensity="medium" className="opacity-60" />
        <CircuitLines />
        <BlobShape position="center" color="accent" className="w-[500px] h-[500px]" />
        <GridPattern squares={[[3, 1], [7, 4], [11, 2], [15, 6]]} className="opacity-35" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
              <h2 className="pb-1 text-3xl font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
                {t("home.roi.title")}
              </h2>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {t("home.roi.description")}
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-10">
            {["response", "lost", "revenue"].map((stat, index) => (
              <ScrollReveal key={stat} delay={(index * 100) as 0 | 100 | 200}>
                <NeonCard className="h-full rounded-lg p-8 text-center">
                  <div className="mb-3 text-5xl font-bold text-gradient-to dark:text-primary sm:text-6xl">
                    <AnimatedNumber
                      value={t(`home.roi.stats.${stat}.value`)}
                      duration={2500}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {t(`home.roi.stats.${stat}.label`)}
                  </p>
                </NeonCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={100}>
            <div className="text-center">
              <NeonButton asChild size="lg" className="dark:glow-primary">
                <Link href="/roi">{t("home.roi.cta")}</Link>
              </NeonButton>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
          <ScrollIndicator targetId="final" />
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section
        variant="alt"
        id="final"
        className="h-[calc(100svh-var(--footer-height,0px))] py-24 overflow-hidden bg-gradient-to-br from-section-alt via-card to-section-alt dark:from-background dark:via-card/50 dark:to-background"
      >
        <AuroraField intensity="strong" className="opacity-70" />
        <BlobShape position="center" color="primary" className="w-[600px] h-[600px]" />
        <BlobShape position="top-left" color="accent" className="w-[400px] h-[400px]" />
        <BlobShape position="bottom-right" color="gradient" className="w-[500px] h-[500px]" />
        <GridPattern squares={[[1, 3], [5, 7], [9, 2], [13, 6], [17, 4]]} className="opacity-35" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <ScrollReveal>
              <h2 className="pb-1 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
                {t("home.finalCTA.title")}
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="text-xl text-muted-foreground">
                {t("home.finalCTA.description")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="flex items-center justify-center">
                <AppointmentLottie size="md" className="text-primary" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="pt-4">
                <NeonButton asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/reservar">{t("home.finalCTA.cta")}</Link>
                </NeonButton>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Section>
    </SiteShell>
  )
}
