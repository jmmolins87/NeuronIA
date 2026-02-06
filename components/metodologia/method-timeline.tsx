"use client"

import * as React from "react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useMountAnimation } from "@/hooks/use-mount-animation"

export function MethodTimeline() {
  const { t } = useTranslation()
  const { ref: timelineRef } = useMountAnimation({ delay: 200, duration: 800 })
  
  const timelineData = t("methodology.timeline.items")
  const timeline = (typeof timelineData === "string" ? [] : timelineData) as Array<{ title: string; text: string }>

  return (
    <div ref={timelineRef as React.RefObject<HTMLDivElement>} className="relative max-w-4xl mx-auto">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-gradient-to hidden md:block" />
      
      <div className="space-y-8">
        {timeline.map((phase, index) => (
          <div key={phase.title} className="relative flex gap-6 md:gap-8">
            {/* Step number */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center text-white dark:text-black font-bold text-xl shadow-lg dark:glow-primary z-10">
              {index + 1}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {phase.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {phase.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
