"use client"

import * as React from "react"

import { FinalCTA } from "@/components/final-cta"
import { Reveal } from "@/components/reveal"
import { Section } from "@/components/section"
import { BlobShape } from "@/components/shapes/blob-shape"

interface FinalCtaSectionProps {
  id?: string
  showMicroCta?: boolean
  titleKey?: string
  descriptionKey?: string
  primaryCtaKey?: string
  secondaryCtaKey?: string
  microCtaKey?: string
  primaryHref?: string
  secondaryHref?: string
  microHref?: string
  primaryOnClick?: () => void
  secondaryOnClick?: () => void
  microOnClick?: () => void
}

export function FinalCtaSection({
  id,
  showMicroCta = true,
  titleKey,
  descriptionKey,
  primaryCtaKey,
  secondaryCtaKey,
  microCtaKey,
  primaryHref,
  secondaryHref,
  microHref,
  primaryOnClick,
  secondaryOnClick,
  microOnClick,
}: FinalCtaSectionProps): React.JSX.Element {
  return (
    <Section
      variant="alt"
      id={id}
      className="min-h-screen md:min-h-[calc(100vh-400px)] flex flex-col justify-center py-16 bg-gradient-to-br from-section-alt via-card to-section-alt dark:from-background dark:via-card/50 dark:to-background pb-12 md:pb-0"
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
          <FinalCTA
            showMicroCta={showMicroCta}
            titleKey={titleKey}
            descriptionKey={descriptionKey}
            primaryCtaKey={primaryCtaKey}
            secondaryCtaKey={secondaryCtaKey}
            microCtaKey={microCtaKey}
            primaryHref={primaryHref}
            secondaryHref={secondaryHref}
            microHref={microHref}
            primaryOnClick={primaryOnClick}
            secondaryOnClick={secondaryOnClick}
            microOnClick={microOnClick}
          />
        </Reveal>
      </div>
    </Section>
  )
}
