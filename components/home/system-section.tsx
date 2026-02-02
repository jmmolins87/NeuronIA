"use client"

import * as React from "react"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { CircuitLines } from "@/components/shapes/circuit-lines"
import { RotatingRings } from "@/components/animations/rotating-rings"
import { Reveal } from "@/components/reveal"
import { Brain, Clock, Calendar, BellRing } from "lucide-react"

export function SystemSection() {
  const { t } = useTranslation()
  const { ref: systemFeaturesRef } = useStagger({ stagger: 100, duration: 600, distance: 40 })

  return (
    <Section variant="default" id="system-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 bg-gradient-to-b from-white via-background to-background dark:from-black dark:via-background dark:to-background pb-12 md:pb-0">
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
  )
}
