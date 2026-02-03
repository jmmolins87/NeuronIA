"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, Calendar } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

interface FinalCTAProps {
  /**
   * Show micro CTA link to ROI calculator
   * @default true
   */
  showMicroCta?: boolean
  /**
   * Custom note text key for i18n
   * If not provided, uses default from home.finalCTA
   */
  noteKey?: string
}

export function FinalCTA({ showMicroCta = true, noteKey }: FinalCTAProps) {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      {/* Micro CTA to ROI */}
      {showMicroCta && (
        <div className="inline-block rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 px-6 py-3 backdrop-blur-sm">
          <Link
            href="/roi"
            className="text-base font-medium text-primary dark:text-accent hover:underline transition-colors sm:text-lg"
          >
            {t("solution.microCta")}
          </Link>
        </div>
      )}

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-pulse">
        {t("home.finalCTA.title")}
      </h2>

      <p className="text-base text-foreground/70 dark:text-foreground/80 sm:text-lg">
        {noteKey ? t(noteKey) : t("home.finalCTA.description")}
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-4">
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto cursor-pointer">
          <Link href="/reservar" className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t("home.finalCTA.cta")}
          </Link>
        </Button>
        <Button asChild size="lg" className="w-full sm:w-auto cursor-pointer dark:glow-primary">
          <Link href="/roi" className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t("solution.cta.secondary")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
