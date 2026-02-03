"use client"

import * as React from "react"
import Link from "next/link"
import { Calculator } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { BlobShape } from "@/components/shapes/blob-shape"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { PrinciplesGrid } from "@/components/metodologia/principles-grid"
import { MethodTimeline } from "@/components/metodologia/method-timeline"
import { ConfigChecklist } from "@/components/metodologia/config-checklist"
import { GuardrailsBlock } from "@/components/metodologia/guardrails-block"
import { WhatWeDontDo } from "@/components/metodologia/what-we-dont-do"
import { FinalCTA } from "@/components/final-cta"
import { useTheme } from "next-themes"

export default function MetodologiaPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const claim = mounted
    ? theme === "dark"
      ? t("methodology.hero.claimDark")
      : t("methodology.hero.claimLight")
    : t("methodology.hero.claimLight")

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section variant="default" className="py-12 md:py-16 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("methodology.hero.heading")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("methodology.hero.subheading")}
              </p>
              <p className="text-lg font-medium text-gradient-to dark:text-primary">
                {claim}
              </p>
              
              {/* Micro CTA */}
              <div className="pt-4">
                <Button asChild variant="outline" size="sm" className="cursor-pointer">
                  <Link href="/roi">
                    <Calculator className="w-4 h-4" />
                    {t("methodology.microCta")}
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Principles Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-card via-muted to-card dark:from-card dark:via-muted dark:to-card">
        <CircuitLines className="opacity-15 dark:opacity-10" />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide mb-4">
                {t("methodology.principles.title")}
              </h2>
            </div>
          </Reveal>
          
          <PrinciplesGrid />
        </div>
      </Section>

      {/* Timeline Section */}
      <Section variant="default" className="py-12 md:py-16 bg-gradient-to-b from-muted via-background to-card/30 dark:from-muted dark:via-background dark:to-card/20">
        <BlobShape position="top-left" color="primary" parallax parallaxSpeed={0.2} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide mb-4">
                {t("methodology.timeline.title")}
              </h2>
            </div>
          </Reveal>
          
          <MethodTimeline />
        </div>
      </Section>

      {/* Config Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-muted via-card to-muted dark:from-muted dark:via-card dark:to-muted">
        <GridPattern squares={[[3, 2], [8, 5], [13, 3], [18, 8]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide mb-4">
                {t("methodology.config.title")}
              </h2>
            </div>
          </Reveal>
          
          <ConfigChecklist />
        </div>
      </Section>

      {/* Guardrails Section */}
      <Section variant="default" className="py-12 md:py-16 bg-gradient-to-b from-card via-background to-muted/30 dark:from-card dark:via-background dark:to-muted/20">
        <BlobShape position="bottom-right" color="accent" parallax parallaxSpeed={0.3} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide mb-4">
                {t("methodology.guardrails.title")}
              </h2>
            </div>
          </Reveal>
          
          <GuardrailsBlock />
        </div>
      </Section>

      {/* What We Don't Do Section */}
      <Section variant="muted" className="py-12 md:py-16 bg-gradient-to-br from-card via-muted to-card dark:from-card dark:via-muted dark:to-card">
        <CircuitLines className="opacity-10 dark:opacity-5" />
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
            <FinalCTA showMicroCta={true} noteKey="methodology.cta.note" />
          </Reveal>
        </div>
      </Section>
    </SiteShell>
  )
}
