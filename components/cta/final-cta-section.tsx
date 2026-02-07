"use client"

import * as React from "react"

import { FinalCTA } from "@/components/final-cta"
import { Reveal } from "@/components/reveal"
import { Section } from "@/components/section"

interface FinalCtaSectionProps {
  id?: string
  showMicroCta?: boolean
  titleKey?: string
  descriptionKey?: string
  primaryCtaKey?: string
  secondaryCtaKey?: string
  tertiaryCtaKey?: string
  microCtaKey?: string
  primaryHref?: string
  secondaryHref?: string
  tertiaryHref?: string
  microHref?: string
  primaryOnClick?: () => void
  secondaryOnClick?: () => void
  tertiaryOnClick?: () => void
  microOnClick?: () => void

  /** optional style overrides */
  titleClassName?: string
}

export function FinalCtaSection({
  id,
  showMicroCta = true,
  titleKey,
  descriptionKey,
  primaryCtaKey,
  secondaryCtaKey,
  tertiaryCtaKey,
  microCtaKey,
  primaryHref,
  secondaryHref,
  tertiaryHref,
  microHref,
  primaryOnClick,
  secondaryOnClick,
  tertiaryOnClick,
  microOnClick,
  titleClassName,
}: FinalCtaSectionProps): React.JSX.Element {
  return (
    <Section
      variant="alt"
      id={id}
      className="home-reflections home-surface-final home-shadow-final min-h-screen md:min-h-[calc(100vh-400px)] flex flex-col justify-center py-16 pb-12 md:pb-0"
    >
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <Reveal delay={100}>
          <FinalCTA
            showMicroCta={showMicroCta}
            titleKey={titleKey}
            descriptionKey={descriptionKey}
            primaryCtaKey={primaryCtaKey}
            secondaryCtaKey={secondaryCtaKey}
            tertiaryCtaKey={tertiaryCtaKey}
            microCtaKey={microCtaKey}
            titleClassName={titleClassName}
            primaryHref={primaryHref}
            secondaryHref={secondaryHref}
            tertiaryHref={tertiaryHref}
            microHref={microHref}
            primaryOnClick={primaryOnClick}
            secondaryOnClick={secondaryOnClick}
            tertiaryOnClick={tertiaryOnClick}
            microOnClick={microOnClick}
          />
        </Reveal>
      </div>
    </Section>
  )
}
