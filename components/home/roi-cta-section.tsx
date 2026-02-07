"use client"

import * as React from "react"
import Link from "next/link"
import { Section } from "@/components/section"
import { RoiButton } from "@/components/cta/roi-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { AnimatedNumber } from "@/components/animated-number"
import { Euro, Clock } from "lucide-react"

export function RoiCtaSection() {
  const { t } = useTranslation()

  return (
    <Section variant="muted" id="roi-section" className="home-reflections min-h-screen flex flex-col justify-center py-12 md:py-16 lg:py-20">
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3 md:space-y-4 lg:space-y-5 mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            {t("home.roi.title")}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-foreground/80 dark:text-foreground/90">
            {t("home.roi.description")}
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 lg:gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-8 md:mb-10">
          {["response", "lost", "revenue"].map((stat) => (
            <div 
              key={stat} 
              className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-5 md:p-6 lg:p-8 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-3 text-gradient-to dark:text-primary">
                <AnimatedNumber 
                  value={t(`home.roi.stats.${stat}.value`)} 
                  duration={2500}
                />
              </div>
              <p className="text-xs md:text-sm lg:text-base text-foreground/70 dark:text-foreground/80">
                {t(`home.roi.stats.${stat}.label`)}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid gap-4 md:gap-5 lg:gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-4 md:p-5 lg:p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                  <Euro className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-black" />
                </div>
                <div className="flex-1 space-y-1 md:space-y-2">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-foreground">
                    {t("home.roi.impact.economic.title")}
                  </h3>
                  <p className="text-sm md:text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
                    {t("home.roi.impact.economic.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-4 md:p-5 lg:p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-black" />
                </div>
                <div className="flex-1 space-y-1 md:space-y-2">
                  <h3 className="text-base md:text-lg lg:text-xl font-bold text-foreground">
                    {t("home.roi.impact.time.title")}
                  </h3>
                  <p className="text-sm md:text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
                    {t("home.roi.impact.time.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <RoiButton asChild size="lg" className="text-base md:text-lg px-6 md:px-8">
            <Link href="/roi">{t("home.roi.cta")}</Link>
          </RoiButton>
        </div>
      </div>
    </Section>
  )
}
