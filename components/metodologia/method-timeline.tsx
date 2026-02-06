"use client"

import * as React from "react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useMountAnimation } from "@/hooks/use-mount-animation"

export function AgencyMethodTimeline() {
  const { t } = useTranslation()
  const { ref: timelineRef } = useMountAnimation({ delay: 200, duration: 800 })
  
  const timelineData = t("methodology.timeline.items")
  const timeline = (typeof timelineData === "string" ? [] : timelineData) as Array<{ title: string; text: string }>

  return (
    <div ref={timelineRef as React.RefObject<HTMLDivElement>} className="relative mx-auto max-w-4xl">
      {/* Vertical line (mobile + desktop) */}
      <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-primary via-accent to-border" />

      <div className="space-y-8">
        {timeline.map((phase, index) => (
          <div key={phase.title} className="relative flex gap-5 md:gap-8">
            {/* Step */}
            <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from via-gradient-purple to-gradient-to text-primary-foreground shadow-lg dark:glow-sm">
              <span className="text-base font-semibold">{index + 1}</span>
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="rounded-xl border-2 border-border bg-card/70 p-6 backdrop-blur-sm transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/15">
                <h3 className="mb-3 text-xl font-bold text-foreground">{phase.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{phase.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Back-compat (old import name)
export const MethodTimeline = AgencyMethodTimeline
