"use client"

import * as React from "react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { 
  CheckCircle2,
  Shield,
  Target,
  GitBranch,
  LayoutGrid,
  Eye
} from "lucide-react"

const PRINCIPLE_ICONS = [
  CheckCircle2, // Claridad
  Shield,       // Criterio clínico
  Target,       // Control
  GitBranch,    // Continuidad
  LayoutGrid,   // Consistencia
  Eye          // Supervisión
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
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm">
                <Icon className="w-6 h-6 text-white dark:text-black" />
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
