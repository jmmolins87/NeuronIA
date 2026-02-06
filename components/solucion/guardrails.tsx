"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { Shield, UserCheck, AlertTriangle, MessageSquare } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [Shield, UserCheck, AlertTriangle, MessageSquare]

export function Guardrails() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 120,
    duration: 650,
    distance: 40,
  })

  const items = [
    t("solution.guardrails.items.0"),
    t("solution.guardrails.items.1"),
    t("solution.guardrails.items.2"),
    t("solution.guardrails.items.3"),
  ]

  return (
    <ul
      ref={staggerRef as React.RefObject<HTMLUListElement>}
      className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto"
    >
      {items.map((item, index) => {
        const Icon = icons[index]
        return (
          <li
            key={index}
            data-stagger-item
            className="group relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                <Icon className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div className="flex-1">
                <p className="text-base text-foreground/90 dark:text-foreground/95 leading-relaxed">
                  {item}
                </p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
