"use client"

import * as React from "react"
import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"

export function ConfigChecklist() {
  const { t } = useTranslation()
  const { ref: listRef } = useStagger({ stagger: 80, duration: 500, distance: 20 })
  
  const lead = t("methodology.config.lead")
  const configData = t("methodology.config.items")
  const items = (typeof configData === "string" ? [] : configData) as string[]

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-lg text-muted-foreground mb-8 text-center">
        {lead}
      </p>
      
      <div ref={listRef as React.RefObject<HTMLDivElement>} className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            data-stagger-item
            className="flex items-start gap-4 rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-4 transition-all hover:border-primary hover:shadow-lg dark:hover:shadow-primary/10"
          >
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-foreground leading-relaxed">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
