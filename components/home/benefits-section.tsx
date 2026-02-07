"use client"

import * as React from "react"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { Reveal } from "@/components/reveal"
import { Zap, TrendingUp, Heart, Target } from "lucide-react"

export function BenefitsSection() {
  const { t } = useTranslation()
  const { ref: benefitsRef } = useStagger({ stagger: 150, duration: 700, distance: 40 })

  return (
    <Section
      variant="default"
      id="benefits-section"
      className="home-reflections home-surface-benefits home-shadow-benefits min-h-screen md:h-screen flex flex-col justify-center py-16 pb-12 md:pb-0"
    >
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {t("home.benefits.title")}
            </h2>
            <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl">
              {t("home.benefits.description")}
            </p>
          </div>
        </Reveal>

        <div ref={benefitsRef as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          <div data-stagger-item className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
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

          <div data-stagger-item className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
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

          <div data-stagger-item className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
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

          <div data-stagger-item className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
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
  )
}
