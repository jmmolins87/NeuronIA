"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { Smile, Stethoscope, Heart, PawPrint } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import Link from "next/link"
import { DemoButton } from "@/components/cta/demo-button"

export function ClinicFit() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 150,
    duration: 700,
    distance: 40,
  })

  const clinics = [
    {
      type: "aesthetics",
      icon: Heart,
      color: "from-pink-500 via-purple-600 to-pink-600 dark:from-pink-500 dark:via-purple-500 dark:to-purple-600",
    },
    {
      type: "dental",
      icon: Smile,
      color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-green-500 dark:via-emerald-500 dark:to-pink-500",
    },
    {
      type: "physio",
      icon: Stethoscope,
      color: "from-green-500 via-purple-600 to-green-600 dark:from-green-500 dark:via-emerald-600 dark:to-emerald-500",
    },
    {
      type: "veterinary",
      icon: PawPrint,
      color: "from-orange-500 via-purple-600 to-amber-600 dark:from-orange-500 dark:via-amber-600 dark:to-amber-500",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div
        ref={staggerRef as React.RefObject<HTMLDivElement>}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-10"
      >
        {clinics.map(({ type, icon: Icon, color }) => (
          <div
            key={type}
            data-stagger-item
            className="group rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg dark:glow-sm`}
              >
                <Icon className="w-7 h-7 text-white dark:text-black" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-4 text-center text-gradient-to dark:text-primary group-hover:text-primary transition-colors">
              {t(`solution.fit.cards.${type}.title`)}
            </h3>

            {/* Content */}
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-foreground/80 dark:text-foreground/90 mb-1">
                  {t(`solution.fit.cards.${type}.situation`)}
                </p>
              </div>

              <div className="rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 p-3">
                <p className="text-red-700 dark:text-red-300 text-xs font-medium">
                  {t(`solution.fit.cards.${type}.problem`)}
                </p>
              </div>

              <div className="rounded-lg bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 p-3">
                <p className="text-green-700 dark:text-green-300 text-xs font-medium">
                  {t(`solution.fit.cards.${type}.change`)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to scenarios */}
      <div className="text-center">
        <DemoButton asChild>
          <Link href="/escenarios">{t("solution.fit.linkText")}</Link>
        </DemoButton>
      </div>
    </div>
  )
}
