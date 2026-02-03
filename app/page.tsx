"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { ActiveSectionIndicator } from "@/components/active-section-indicator"
import { FinalCtaSection } from "@/components/cta/final-cta-section"
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

      <FinalCtaSection id="final-cta-section" showMicroCta={true} />
    </SiteShell>
  )
}
