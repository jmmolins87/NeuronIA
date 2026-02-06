"use client"

import * as React from "react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { 
  CheckCircle2,
  HeartHandshake,
  ShieldAlert,
  SlidersHorizontal,
  Timer,
  Zap
} from "lucide-react"

const PRINCIPLE_ICONS = [
  CheckCircle2,
  Zap,
  HeartHandshake,
  ShieldAlert,
  SlidersHorizontal,
  Timer,
]

export function PrinciplesGrid() {
  const { t } = useTranslation()
  const { ref: gridRef } = useStagger({ stagger: 100, duration: 600, distance: 30 })
  
  const principlesData = t("methodology.principles.items")
  const principles = (typeof principlesData === "string" ? [] : principlesData) as Array<{ title: string; text: string }>

  return (
    <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {principles.map((principle, index) => {
        const Icon = PRINCIPLE_ICONS[index] || CheckCircle2
        return (
          <div
            key={principle.title}
            data-stagger-item
            className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from via-gradient-purple to-gradient-to shadow-lg dark:glow-sm">
                <Icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {principle.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.text}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
