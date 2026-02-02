"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useTheme } from "next-themes"
import { Reveal } from "@/components/reveal"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { BlobShape } from "@/components/shapes/blob-shape"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { FloatingParticles } from "@/components/animations/floating-particles"
import { WaveLines } from "@/components/animations/wave-lines"
import { PulsingGrid } from "@/components/animations/pulsing-grid"
import { FeatureGrid } from "@/components/solucion/feature-grid"
import { HowItWorksSteps } from "@/components/solucion/how-it-works-steps"
import { Guardrails } from "@/components/solucion/guardrails"
import { ClinicFit } from "@/components/solucion/clinic-fit"
import { FrictionlessFlowMini } from "@/components/solucion/frictionless-flow-mini"
import { FinalCTA } from "@/components/final-cta"
import { Sparkles, AlertCircle } from "lucide-react"

export default function SolucionPage() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const claim = isDark
    ? t("solution.hero.claimDark")
    : t("solution.hero.claimLight")

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <GridPattern squares={[[2, 1], [6, 3]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Sparkles className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("solution.hero.heading")}
              </h1>

              <p className="text-xl font-medium text-primary dark:text-accent sm:text-2xl">
                {claim}
              </p>

              <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl max-w-3xl mx-auto">
                {t("solution.hero.subheading")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* What is Section */}
      <Section
        variant="muted"
        className="py-16 md:py-20 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted"
      >
        <BlobShape
          position="top-left"
          color="primary"
          className="w-96 h-96 opacity-30"
          parallax
          parallaxSpeed={0.15}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-center gradient-text-slide">
                {t("solution.what.title")}
              </h2>

              <div className="space-y-6 text-center">
                <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
                  {t("solution.what.p1")}
                </p>
                <p className="text-base text-foreground/70 dark:text-foreground/80 sm:text-lg">
                  {t("solution.what.p2")}
                </p>
              </div>

              {/* Key message */}
              <div className="mt-8 rounded-2xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 p-6 md:p-8 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-300 sm:text-xl">
                  {t("solution.keyMessage")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Day to day Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <GridPattern squares={[[3, 2], [12, 3]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-bounce">
                {t("solution.day.title")}
              </h2>
            </div>
          </Reveal>

          <FeatureGrid />
        </div>
      </Section>

      {/* How it works Section */}
      <Section
        variant="card"
        className="py-16 md:py-20 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted"
      >
        <BlobShape
          position="bottom-right"
          color="accent"
          className="w-[400px] h-[400px] opacity-20"
          parallax
          parallaxSpeed={0.15}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-shimmer">
                {t("solution.how.title")}
              </h2>
            </div>
          </Reveal>

          <HowItWorksSteps />
        </div>
      </Section>

      {/* Flow Section */}
      <Section
        variant="muted"
        className="py-16 md:py-20 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted"
      >
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-flow">
                {t("solution.flow.title")}
              </h2>
            </div>
          </Reveal>

          <FrictionlessFlowMini />
        </div>
      </Section>

      {/* Guardrails Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-background dark:from-black dark:via-background dark:to-background"
      >
        <GridPattern squares={[[5, 1], [15, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-pulse">
                {t("solution.guardrails.title")}
              </h2>
            </div>
          </Reveal>

          <Guardrails />
        </div>
      </Section>

      {/* Clinic Fit Section */}
      <Section
        variant="card"
        className="py-16 md:py-20 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted"
      >
        <BlobShape
          position="top-right"
          color="gradient"
          className="w-80 h-80 opacity-25"
          parallax
          parallaxSpeed={0.15}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-shimmer">
                {t("solution.fit.title")}
              </h2>
              <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
                {t("solution.fit.description")}
              </p>
            </div>
          </Reveal>

          <ClinicFit />
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section
        variant="default"
        className="py-20 md:py-24 bg-gradient-to-br from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <BlobShape
          position="center"
          color="primary"
          className="w-[500px] h-[500px] opacity-20"
          parallax
          parallaxSpeed={0.1}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <FinalCTA showMicroCta={true} noteKey="solution.cta.note" />
          </Reveal>
        </div>
      </Section>
    </SiteShell>
  )
}
