"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { BlobShape } from "@/components/shapes/blob-shape"
import { ActiveSectionIndicator } from "@/components/active-section-indicator"
import { FinalCTA } from "@/components/final-cta"
import { HeroSection } from "@/components/home/hero-section"
import { ProblemSection } from "@/components/home/problem-section"
import { SystemSection } from "@/components/home/system-section"
import { FlowSection } from "@/components/home/flow-section"
import { BenefitsSection } from "@/components/home/benefits-section"
import { ScenariosSection } from "@/components/home/scenarios-section"
import { RoiCtaSection } from "@/components/home/roi-cta-section"

export default function Home() {
  return (
    <SiteShell>
      <ActiveSectionIndicator />
      <HeroSection />
      <ProblemSection />
      <SystemSection />
      <FlowSection />
      <BenefitsSection />
      <ScenariosSection />
      <RoiCtaSection />
      
      <Section variant="alt" id="final-cta-section" className="min-h-screen md:min-h-[calc(100vh-400px)] flex flex-col justify-center py-16 bg-gradient-to-br from-section-alt via-card to-section-alt dark:from-background dark:via-card/50 dark:to-background pb-12 md:pb-0">
        <BlobShape position="center" color="primary" className="w-[500px] h-[500px] opacity-20" parallax parallaxSpeed={0.1} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <FinalCTA showMicroCta={true} />
        </div>
      </Section>
    </SiteShell>
  )
}
