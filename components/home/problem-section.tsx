"use client"

import * as React from "react"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { FloatingParticles } from "@/components/animations/floating-particles"
import { Reveal } from "@/components/reveal"
import { MessageCircle, Users, AlertCircle, Calendar } from "lucide-react"

export function ProblemSection() {
  const { t } = useTranslation()
  const { ref: problemCardsRef } = useStagger({ stagger: 120, duration: 650, distance: 40 })

  return (
    <Section variant="card" id="problem-section" className="ambient-section min-h-screen flex flex-col justify-center pt-24 pb-12 md:py-16 lg:py-20 relative overflow-hidden">
      <FloatingParticles count={60} color="red" size="lg" />
      
      <div className="absolute inset-0 bg-gradient-radial from-red-600/20 via-transparent to-transparent dark:from-red-600/30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-destructive/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-destructive/5 pointer-events-none" />
      
      <BlobShape position="top-left" color="primary" className="w-[500px] h-[500px] opacity-10" parallax parallaxSpeed={0.2} />
      <BlobShape position="bottom-right" color="accent" className="w-[600px] h-[600px] opacity-10" parallax parallaxSpeed={0.3} />
      <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8], [5, 10], [15, 6]]} />
      
      <div className="container relative z-10 mx-auto max-w-screen-xl px-fluid">
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-3 md:space-y-4 lg:space-y-5 mb-8 md:mb-10 lg:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t("home.problem.title")}
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-red-600 dark:text-red-400">
              {t("home.problem.subtitle")}
            </p>
            <p className="text-base md:text-lg lg:text-xl text-foreground/80 dark:text-foreground/90 max-w-3xl mx-auto">
              {t("home.problem.description")}
            </p>
          </div>
        </Reveal>

        <div ref={problemCardsRef as React.RefObject<HTMLDivElement>} className="grid gap-4 md:gap-5 lg:gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-8">
          <div data-stagger-item className="group relative rounded-xl border border-red-900/50 bg-card/80 backdrop-blur-sm p-4 md:p-5 lg:p-6 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-3 md:mb-0 md:absolute md:-top-4 md:-left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="space-y-2 md:pt-4">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 text-center md:text-left">
                {t("home.problem.issues.unanswered.title")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.unanswered.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border border-red-900/50 bg-card/80 backdrop-blur-sm p-4 md:p-5 lg:p-6 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-3 md:mb-0 md:absolute md:-top-4 md:-left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="space-y-2 md:pt-4">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 text-center md:text-left">
                {t("home.problem.issues.overload.title")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.overload.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border border-red-900/50 bg-card/80 backdrop-blur-sm p-4 md:p-5 lg:p-6 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-3 md:mb-0 md:absolute md:-top-4 md:-left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="space-y-2 md:pt-4">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 text-center md:text-left">
                {t("home.problem.issues.missed.title")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.missed.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border border-red-900/50 bg-card/80 backdrop-blur-sm p-4 md:p-5 lg:p-6 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-3 md:mb-0 md:absolute md:-top-4 md:-left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="space-y-2 md:pt-4">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 text-center md:text-left">
                {t("home.problem.issues.chaos.title")}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.chaos.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
