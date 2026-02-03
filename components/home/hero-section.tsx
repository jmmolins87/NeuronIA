"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { FloatingParticles } from "@/components/animations/floating-particles"
import { ScrollIndicator } from "@/components/scroll-indicator"

const ThreeBackdrop = dynamic(
  () => import("@/components/canvas/three-backdrop").then((mod) => mod.ThreeBackdrop),
  { ssr: false }
)

export function HeroSection() {
  const { t } = useTranslation()
  
  const { ref: heroLogoRef } = useMountAnimation({ delay: 100, duration: 1000, distance: 40 })
  const { ref: heroTitleRef } = useMountAnimation({ delay: 300, duration: 1000, distance: 50 })
  const { ref: heroSubtitleRef } = useMountAnimation({ delay: 500, duration: 900, distance: 40 })
  const { ref: heroButtonsRef } = useMountAnimation({ delay: 900, duration: 800, distance: 30 })

  return (
    <Section variant="default" id="hero" className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-white via-background to-card/50 dark:from-black dark:via-background dark:to-card/30 pb-12 md:pb-0">
      <FloatingParticles count={30} color="primary" size="sm" />
      <ThreeBackdrop />
      <div className="container relative z-10 mx-auto max-w-screen-2xl px-fluid py-8 md:py-0 text-center flex-1 flex items-center">
        <div className="max-w-7xl mx-auto space-fluid-lg w-full">
          <div ref={heroLogoRef as React.RefObject<HTMLDivElement>} className="hidden md:flex justify-center" style={{ height: 'clamp(9rem, 12vh, 15rem)' }}>
            <Logo 
              width={800} 
              height={200} 
              className="h-full w-auto"
            />
          </div>

          <h1 ref={heroTitleRef as React.RefObject<HTMLHeadingElement>} className="hero-title text-fluid-5xl md:text-fluid-6xl font-bold tracking-tight gradient-text-slide leading-tight">
            {t("home.hero.claim")}
          </h1>

          <p ref={heroSubtitleRef as React.RefObject<HTMLParagraphElement>} className="hero-subtitle mx-auto max-w-4xl text-fluid-2xl md:text-fluid-3xl font-medium text-foreground/90 dark:text-foreground/95">
            {t("home.hero.keyMessage")}
          </p>

          <div ref={heroButtonsRef as React.RefObject<HTMLDivElement>} className="flex flex-col items-center gap-fluid-sm sm:flex-row sm:justify-center pt-4">
            <Button asChild size="lg" variant="outline" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.25rem)', padding: 'clamp(0.75rem, 1.5vh, 1.5rem) clamp(1.5rem, 3vw, 2rem)' }} className="w-full sm:w-auto cursor-pointer">
              <Link href="/reservar">{t("home.hero.cta1")}</Link>
            </Button>
            <Button asChild size="lg" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.25rem)', padding: 'clamp(0.75rem, 1.5vh, 1.5rem) clamp(1.5rem, 3vw, 2rem)' }} className="w-full sm:w-auto cursor-pointer dark:glow-primary">
              <Link href="/roi">{t("home.hero.cta2")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-8">
        <ScrollIndicator targetId="problem-section" />
      </div>
    </Section>
  )
}
