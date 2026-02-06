"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Calculator, Sparkles } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { DemoButton } from "@/components/cta/demo-button"
import { RoiButton } from "@/components/cta/roi-button"
import { FinalCtaSection } from "@/components/cta/final-cta-section"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { BlobShape } from "@/components/shapes/blob-shape"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { PrinciplesGrid } from "@/components/metodologia/principles-grid"
import { WhatWeDo } from "@/components/metodologia/what-we-do"
import { AgencyMethodTimeline } from "@/components/metodologia/method-timeline"
import { ConfigChecklist } from "@/components/metodologia/config-checklist"
import { SafetyLimits } from "@/components/metodologia/safety-limits"
import { WhatWeDontDo } from "@/components/metodologia/what-we-dont-do"
import { useTheme } from "next-themes"

export default function MetodologiaPage() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const claim = mounted
    ? resolvedTheme === "dark"
      ? t("methodology.hero.claimDark")
      : t("methodology.hero.claimLight")
    : t("methodology.hero.claimLight")

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="mx-auto max-w-4xl space-y-7 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{t("methodology.hero.title")}</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {t("methodology.hero.heading")}
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground sm:text-2xl">
                {t("methodology.hero.subheading")}
              </p>

              <div className="space-y-3">
                <p className="text-base font-medium text-foreground/80">{claim}</p>
                <p className="text-lg font-semibold text-foreground">{t("methodology.keyMessage")}</p>
              </div>

              <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
                <DemoButton asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/reservar" className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t("methodology.cta.primary")}
                  </Link>
                </DemoButton>
                <RoiButton asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/roi" className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {t("methodology.cta.secondary")}
                  </Link>
                </RoiButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* What We Do */}
      <Section variant="muted" className="ambient-section py-12 md:py-16">
        <CircuitLines className="opacity-10" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("methodology.what.title")}
              </h2>
            </div>
          </Reveal>
          <WhatWeDo />
        </div>
      </Section>

      {/* Principles Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <BlobShape position="top-left" color="gradient" parallax parallaxSpeed={0.18} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("methodology.principles.title")}
              </h2>
            </div>
          </Reveal>
          
          <PrinciplesGrid />
        </div>
      </Section>

      {/* Timeline Section */}
      <Section variant="muted" className="ambient-section py-12 md:py-16">
        <GridPattern squares={[[3, 2], [8, 5], [13, 3], [18, 8]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("methodology.timeline.title")}
              </h2>
            </div>
          </Reveal>
          
          <AgencyMethodTimeline />
        </div>
      </Section>

      {/* Config Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <BlobShape position="bottom-right" color="primary" parallax parallaxSpeed={0.22} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("methodology.config.title")}
              </h2>
            </div>
          </Reveal>
          
          <ConfigChecklist />
        </div>
      </Section>

      {/* Safety & Limits */}
      <Section variant="muted" className="ambient-section py-12 md:py-16">
        <CircuitLines className="opacity-10" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("methodology.safety.title")}
              </h2>
            </div>
          </Reveal>
          
          <SafetyLimits />
        </div>
      </Section>

      {/* What We Don't Do Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <BlobShape position="top-right" color="accent" parallax parallaxSpeed={0.16} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {t("methodology.not.title")}
              </h2>
            </div>
          </Reveal>
          
          <WhatWeDontDo />
        </div>
      </Section>

      {/* Final CTA */}
      <FinalCtaSection
        showMicroCta
        titleKey="methodology.finalCta.title"
        descriptionKey="methodology.finalCta.note"
        primaryCtaKey="methodology.finalCta.primary"
        secondaryCtaKey="methodology.finalCta.secondary"
        tertiaryCtaKey="methodology.finalCta.tertiary"
        microCtaKey="methodology.microCta"
        titleClassName="text-foreground"
        primaryHref="/reservar"
        secondaryHref="/solucion"
        tertiaryHref="/como-funciona"
        microHref="/roi"
      />
    </SiteShell>
  )
}
