"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { Zap, MessageCircle, CheckCircle, Heart } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [Zap, MessageCircle, CheckCircle, Heart]

export function PatientExperience() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 120,
    duration: 650,
    distance: 40,
  })

  const items = [
    t("howItWorks.patient.items.0"),
    t("howItWorks.patient.items.1"),
    t("howItWorks.patient.items.2"),
    t("howItWorks.patient.items.3"),
  ]

  return (
    <ul
      ref={staggerRef as React.RefObject<HTMLUListElement>}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
    >
      {items.map((item, index) => {
        const Icon = icons[index]
        return (
          <li
            key={index}
            data-stagger-item
            className="group relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm">
                <Icon className="w-6 h-6 text-white dark:text-black" />
              </div>
              <p className="text-base text-foreground/90 dark:text-foreground/95 leading-relaxed">
                {item}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
