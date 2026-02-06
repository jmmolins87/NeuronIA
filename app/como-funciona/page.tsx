"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useTheme } from "next-themes"
import { Reveal } from "@/components/reveal"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { BlobShape } from "@/components/shapes/blob-shape"
import { StepsTimeline } from "@/components/como-funciona/steps-timeline"
import { DataNeeded } from "@/components/como-funciona/data-needed"
import { Supervision } from "@/components/como-funciona/supervision"
import { PatientExperience } from "@/components/como-funciona/patient-experience"
import { HowFaq } from "@/components/como-funciona/how-faq"
import { FinalCtaSection } from "@/components/cta/final-cta-section"
import { Workflow, AlertCircle } from "lucide-react"

export default function ComoFuncionaPage() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const claim = isDark
    ? t("howItWorks.hero.claimDark")
    : t("howItWorks.hero.claimLight")

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <GridPattern squares={[[2, 1], [8, 4]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Workflow className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("howItWorks.hero.heading")}
              </h1>

              <p className="text-xl font-medium text-primary dark:text-accent sm:text-2xl">
                {claim}
              </p>

              <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl max-w-3xl mx-auto">
                {t("howItWorks.hero.subheading")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Steps Section */}
      <Section
        variant="muted"
        className="py-16 md:py-20 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted"
      >
        <BlobShape
          position="top-left"
          color="primary"
          className="w-96 h-96 opacity-20"
          parallax
          parallaxSpeed={0.15}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
                {t("howItWorks.steps.title")}
              </h2>
            </div>
          </Reveal>

          <StepsTimeline />
        </div>
      </Section>

      {/* Data Needed Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <GridPattern squares={[[5, 2], [14, 6]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-bounce">
                {t("howItWorks.data.title")}
              </h2>
            </div>
          </Reveal>

          <DataNeeded />
        </div>
      </Section>

      {/* Supervision Section */}
      <Section
        variant="card"
        className="py-16 md:py-20 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted"
      >
        <BlobShape
          position="bottom-right"
          color="accent"
          className="w-80 h-80 opacity-25"
          parallax
          parallaxSpeed={0.15}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-pulse">
                {t("howItWorks.supervision.title")}
              </h2>
            </div>
          </Reveal>

          <Supervision />
        </div>
      </Section>

      {/* Messaging Section */}
      <Section
        variant="muted"
        className="py-16 md:py-20 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted"
      >
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-shimmer">
                {t("howItWorks.messaging.title")}
              </h2>

              <div className="space-y-4">
                <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
                  {t("howItWorks.messaging.p1")}
                </p>
                <p className="text-base text-foreground/70 dark:text-foreground/80 sm:text-lg">
                  {t("howItWorks.messaging.p2")}
                </p>
              </div>

              {/* Key message */}
              <div className="mt-8 rounded-2xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 p-6 md:p-8 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-lg font-semibold text-red-700 dark:text-red-300 sm:text-xl">
                  {t("howItWorks.keyMessage")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Patient Experience Section */}
      <Section
        variant="default"
        className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <GridPattern squares={[[3, 3], [16, 7]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-flow">
                {t("howItWorks.patient.title")}
              </h2>
            </div>
          </Reveal>

          <PatientExperience />
        </div>
      </Section>

      {/* FAQ Section */}
      <Section
        variant="card"
        className="py-16 md:py-20 bg-gradient-to-b from-card to-muted dark:from-card dark:to-muted"
      >
        <BlobShape
          position="center"
          color="gradient"
          className="w-[500px] h-[500px] opacity-20"
          parallax
          parallaxSpeed={0.1}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-wave">
                {t("howItWorks.faq.title")}
              </h2>
            </div>
          </Reveal>

          <HowFaq />
        </div>
      </Section>

      <FinalCtaSection showMicroCta={true} descriptionKey="howItWorks.cta.note" />
    </SiteShell>
  )
}
