"use client"

import * as React from "react"
import Link from "next/link"
import { Calculator, Calendar } from "lucide-react"

import { DemoButton } from "@/components/cta/demo-button"
import { BorderButton } from "@/components/cta/border-button"
import { RoiButton } from "@/components/cta/roi-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"

interface FinalCTAProps {
  /**
   * Show micro CTA link to ROI calculator
   * @default true
   */
  showMicroCta?: boolean
  /**
   * Back-compat note text key for i18n.
   * Prefer descriptionKey.
   */
  noteKey?: string

  /** i18n key overrides (defaults to home CTA) */
  titleKey?: string
  descriptionKey?: string
  primaryCtaKey?: string
  secondaryCtaKey?: string
  tertiaryCtaKey?: string
  microCtaKey?: string

  /** optional style overrides */
  titleClassName?: string

  /** href overrides */
  primaryHref?: string
  secondaryHref?: string
  tertiaryHref?: string
  microHref?: string

  /** optional click overrides (use for confirm flows) */
  primaryOnClick?: () => void
  secondaryOnClick?: () => void
  tertiaryOnClick?: () => void
  microOnClick?: () => void
}

export function FinalCTA({
  showMicroCta = true,
  noteKey,
  titleKey,
  descriptionKey,
  primaryCtaKey,
  secondaryCtaKey,
  tertiaryCtaKey,
  microCtaKey,
  titleClassName,
  primaryHref,
  secondaryHref,
  tertiaryHref,
  microHref,
  primaryOnClick,
  secondaryOnClick,
  tertiaryOnClick,
  microOnClick,
}: FinalCTAProps) {
  const { t } = useTranslation()

  const resolvedTitleKey = titleKey ?? "home.finalCTA.title"
  const resolvedDescriptionKey = descriptionKey ?? noteKey ?? "home.finalCTA.description"
  const resolvedPrimaryCtaKey = primaryCtaKey ?? "home.finalCTA.cta"
  const resolvedSecondaryCtaKey = secondaryCtaKey ?? "solution.cta.secondary"
  const resolvedTertiaryCtaKey = tertiaryCtaKey
  const resolvedMicroCtaKey = microCtaKey ?? "solution.microCta"

  const resolvedPrimaryHref = primaryHref ?? "/reservar"
  const resolvedSecondaryHref = secondaryHref ?? "/roi"
  const resolvedTertiaryHref = tertiaryHref
  const resolvedMicroHref = microHref ?? "/roi"

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8 pb-5">
      {/* Micro CTA to ROI */}
      {showMicroCta && (
        <div className="inline-block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 px-6 py-3 backdrop-blur-sm">
          {microOnClick ? (
            <button
              type="button"
              onClick={microOnClick}
              className="text-base font-medium text-primary dark:text-accent hover:underline transition-colors sm:text-lg"
            >
              {t(resolvedMicroCtaKey)}
            </button>
          ) : (
            <Link
              href={resolvedMicroHref}
              className="text-base font-medium text-primary dark:text-accent hover:underline transition-colors sm:text-lg"
            >
              {t(resolvedMicroCtaKey)}
            </Link>
          )}
        </div>
      )}

      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
          titleClassName ?? "text-foreground"
        )}
      >
        {t(resolvedTitleKey)}
      </h2>

      <p className="text-base text-foreground/70 dark:text-foreground/80 sm:text-lg">
        {t(resolvedDescriptionKey)}
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-2">
        <DemoButton asChild size="lg" className="w-full sm:w-auto">
          {primaryOnClick ? (
            <button type="button" onClick={primaryOnClick} className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t(resolvedPrimaryCtaKey)}
            </button>
          ) : (
            <Link href={resolvedPrimaryHref} className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t(resolvedPrimaryCtaKey)}
            </Link>
          )}
        </DemoButton>
        <RoiButton asChild size="lg" className="w-full sm:w-auto">
          {secondaryOnClick ? (
            <button type="button" onClick={secondaryOnClick} className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {t(resolvedSecondaryCtaKey)}
            </button>
          ) : (
            <Link href={resolvedSecondaryHref} className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {t(resolvedSecondaryCtaKey)}
            </Link>
          )}
        </RoiButton>

        {resolvedTertiaryCtaKey && resolvedTertiaryHref && (
          <BorderButton asChild className="w-full sm:w-auto">
            {tertiaryOnClick ? (
              <button type="button" onClick={tertiaryOnClick} className="flex items-center gap-2">
                {t(resolvedTertiaryCtaKey)}
              </button>
            ) : (
              <Link href={resolvedTertiaryHref} className="flex items-center gap-2">
                {t(resolvedTertiaryCtaKey)}
              </Link>
            )}
          </BorderButton>
        )}
      </div>
    </div>
  )
}
