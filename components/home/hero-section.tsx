"use client"

import * as React from "react"
import Link from "next/link"
import { DemoButton } from "@/components/cta/demo-button"
import { RoiButton } from "@/components/cta/roi-button"
import { Logo } from "@/components/logo"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useMountAnimation } from "@/hooks/use-mount-animation"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { HeroModernBackground } from "@/components/backgrounds/hero-modern-bg"

export function HeroSection() {
  const { t } = useTranslation()
  
  const { ref: heroLogoRef } = useMountAnimation({ delay: 100, duration: 1000, distance: 40 })
  const { ref: heroTitleRef } = useMountAnimation({ delay: 300, duration: 1000, distance: 50 })
  const { ref: heroSubtitleRef } = useMountAnimation({ delay: 500, duration: 900, distance: 40 })
  const { ref: heroButtonsRef } = useMountAnimation({ delay: 900, duration: 800, distance: 30 })

  return (
    <Section variant="default" id="hero" className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden py-8">
      {/* Modern animated background */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <HeroModernBackground />
      </div>
      
      {/* Hero content - stays in place */}
      <div className="container relative z-10 mx-auto max-w-screen-2xl px-fluid pt-4 md:pt-8 text-center flex-1 flex flex-col items-center justify-start">
        <div className="max-w-7xl mx-auto space-fluid-lg w-full">
          <div
            ref={heroLogoRef as React.RefObject<HTMLDivElement>}
            className="hidden h-[clamp(9rem,12vh,15rem)] md:flex justify-center"
          >
            <Logo 
              width={800} 
              height={200} 
              className="h-full w-auto"
            />
          </div>

          <h1 ref={heroTitleRef as React.RefObject<HTMLHeadingElement>} className="hero-title text-fluid-5xl md:text-fluid-6xl font-bold tracking-tight text-foreground leading-tight">
            {t("home.hero.claim")}
          </h1>

          <p ref={heroSubtitleRef as React.RefObject<HTMLParagraphElement>} className="hero-subtitle mx-auto max-w-4xl text-fluid-2xl md:text-fluid-3xl font-medium text-foreground/90 dark:text-foreground/95">
            {t("home.hero.keyMessage")}
          </p>

          <div ref={heroButtonsRef as React.RefObject<HTMLDivElement>} className="flex flex-col items-center gap-fluid-sm sm:flex-row sm:justify-center pt-4">
            <DemoButton
              asChild
              size="lg"
              className="w-full sm:w-auto text-[clamp(1rem,1.2vw,1.25rem)] px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1.5rem)]"
            >
              <Link href="/reservar">{t("home.hero.cta1")}</Link>
            </DemoButton>
            <RoiButton
              asChild
              size="lg"
              className="w-full sm:w-auto text-[clamp(1rem,1.2vw,1.25rem)] px-[clamp(1.5rem,3vw,2rem)] py-[clamp(0.75rem,1.5vh,1.5rem)]"
            >
              <Link href="/roi">{t("home.hero.cta2")}</Link>
            </RoiButton>
          </div>
        </div>

        {/* Scroll indicator closer to content */}
        <div className="mt-8 md:mt-12">
          <ScrollIndicator targetId="problem-section" />
        </div>
      </div>
    </Section>
  )
}
