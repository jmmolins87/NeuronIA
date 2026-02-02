"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { Settings, Workflow, Shield, Play } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [Settings, Workflow, Shield, Play]

export function HowItWorksSteps() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 150,
    duration: 700,
    distance: 40,
  })
  const lineRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const line = lineRef.current
    if (!line) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const { animate } = await import("animejs")

            animate(line, {
              scaleY: [0, 1],
              duration: 1500,
              ease: "out-cubic",
              delay: 400,
            })

            observer.unobserve(line)
          }
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(line)
    return () => observer.disconnect()
  }, [])

  const steps = [
    t("solution.how.steps.0"),
    t("solution.how.steps.1"),
    t("solution.how.steps.2"),
    t("solution.how.steps.3"),
  ]

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto relative">
      {/* Vertical animated line - Mobile/Tablet only */}
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border overflow-hidden lg:hidden">
        <div
          ref={lineRef}
          className="w-full h-full bg-gradient-to-b from-primary via-accent to-gradient-to origin-top scale-y-0"
          style={{ transformOrigin: "top" }}
        />
      </div>

      {/* Steps with stagger */}
      <ul
        ref={staggerRef as React.RefObject<HTMLUListElement>}
        className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 relative"
      >
        {steps.map((step, index) => {
          const Icon = icons[index]
          return (
            <li
              key={index}
              data-stagger-item
              className="flex items-start gap-4 lg:gap-5 relative"
            >
              {/* Number badge */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gradient-to flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg dark:glow-primary z-10">
                {index + 1}
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-xl border-2 border-border bg-card/90 backdrop-blur-xl p-6 hover:border-primary hover:shadow-xl transition-all dark:hover:glow-md">
                <div className="flex items-start gap-4">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-base lg:text-lg font-medium text-foreground/90 dark:text-foreground/95 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
