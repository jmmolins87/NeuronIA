"use client"

import * as React from "react"
import { AlertTriangle, ClipboardList, HeartPulse, Stethoscope } from "lucide-react"

import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"

const SAFETY_ICONS = [Stethoscope, AlertTriangle, ClipboardList, HeartPulse]

export function SafetyLimits() {
  const { t } = useTranslation()
  const { ref: gridRef } = useStagger({ stagger: 90, duration: 600, distance: 24 })

  const data = t("methodology.safety.items")
  const items = (typeof data === "string" ? [] : data) as Array<{ title: string; text: string }>

  return (
    <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid gap-6 md:grid-cols-2">
      {items.map((item, index) => {
        const Icon = SAFETY_ICONS[index] ?? Stethoscope
        return (
          <div
            key={item.title}
            data-stagger-item
            className="rounded-xl border-2 border-border bg-card/70 p-6 backdrop-blur-sm transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/15"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
