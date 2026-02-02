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
    <Section variant="card" id="problem-section" className="min-h-screen md:h-screen flex flex-col justify-center py-16 md:pt-32 md:pb-16 pb-16 md:pb-16 bg-gradient-to-b from-red-950/30 via-orange-950/20 to-red-950/30 dark:from-red-950/50 dark:via-orange-950/30 dark:to-red-950/50 relative overflow-hidden">
      <FloatingParticles count={60} color="red" size="lg" />
      
      <div className="absolute inset-0 bg-gradient-radial from-red-600/20 via-transparent to-transparent dark:from-red-600/30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-red-500/10 to-transparent dark:from-red-500/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-600/10 to-transparent dark:from-orange-600/20 pointer-events-none" />
      
      <BlobShape position="top-left" color="primary" className="w-[500px] h-[500px] opacity-10" parallax parallaxSpeed={0.2} />
      <BlobShape position="bottom-right" color="accent" className="w-[600px] h-[600px] opacity-10" parallax parallaxSpeed={0.3} />
      <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8], [5, 10], [15, 6]]} />
      
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-6 xl:space-y-3 mb-16 xl:mb-12">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-danger">
              {t("home.problem.title")}
            </h2>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400 sm:text-3xl">
              {t("home.problem.subtitle")}
            </p>
            <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl max-w-2xl mx-auto">
              {t("home.problem.description")}
            </p>
          </div>
        </Reveal>

        <div ref={problemCardsRef as React.RefObject<HTMLDivElement>} className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto mb-12">
          <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-3 md:pt-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                {t("home.problem.issues.unanswered.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.unanswered.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-3 md:pt-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                {t("home.problem.issues.overload.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.overload.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-3 md:pt-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                {t("home.problem.issues.missed.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.missed.description")}
              </p>
            </div>
          </div>

          <div data-stagger-item className="group relative rounded-xl border-2 border-red-900/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 transition-all hover:border-red-600 hover:shadow-2xl hover:shadow-red-500/20 dark:hover:shadow-red-500/30 overflow-visible">
            <div className="mb-4 md:mb-0 md:absolute md:-top-5 md:-left-5 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-shadow mx-auto md:mx-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-3 md:pt-4">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 sm:text-2xl text-center md:text-left">
                {t("home.problem.issues.chaos.title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {t("home.problem.issues.chaos.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
