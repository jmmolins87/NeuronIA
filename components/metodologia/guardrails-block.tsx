"use client"

import * as React from "react"
import { Shield } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"

export function GuardrailsBlock() {
  const { t } = useTranslation()
  const { ref: listRef } = useStagger({ stagger: 80, duration: 500, distance: 20 })
  
  const guardrailsData = t("methodology.guardrails.items")
  const items = (typeof guardrailsData === "string" ? [] : guardrailsData) as string[]

  return (
    <div className="max-w-3xl mx-auto">
      <div ref={listRef as React.RefObject<HTMLDivElement>} className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            data-stagger-item
            className="flex items-start gap-4 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 backdrop-blur-sm p-5 transition-all hover:border-primary hover:shadow-xl dark:hover:shadow-primary/20"
          >
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-foreground leading-relaxed">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
