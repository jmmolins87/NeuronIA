"use client"

import * as React from "react"
import Link from "next/link"

import { DemoButton } from "@/components/cta/demo-button"
import { RoiButton } from "@/components/cta/roi-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"

interface ScenariosCtaProps {
  className?: string
}

export function ScenariosCta({ className }: ScenariosCtaProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-background/50 backdrop-blur-sm p-7 md:p-8 text-center",
        className
      )}
    >
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text-shimmer">
        {t("scenarios.cta.title")}
      </h3>
      <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        {t("scenarios.cta.description")}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <DemoButton asChild size="lg" className="w-full sm:w-auto">
          <Link href="/reservar">{t("scenarios.cta.demo")}</Link>
        </DemoButton>
        <RoiButton asChild size="lg" className="w-full sm:w-auto">
          <Link href="/roi">{t("scenarios.cta.roi")}</Link>
        </RoiButton>
      </div>
    </div>
  )
}
