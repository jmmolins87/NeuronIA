"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { CheckCircle } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

export function FeatureGrid() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 120,
    duration: 650,
    distance: 40,
  })

  const items = [
    t("solution.day.items.0"),
    t("solution.day.items.1"),
    t("solution.day.items.2"),
    t("solution.day.items.3"),
    t("solution.day.items.4"),
  ]

  return (
    <ul
      ref={staggerRef as React.RefObject<HTMLUListElement>}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
    >
      {items.map((item, index) => (
        <li
          key={index}
          data-stagger-item
          className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div className="flex-1">
              <p className="text-base text-foreground/90 dark:text-foreground/95 leading-relaxed">
                {item}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
