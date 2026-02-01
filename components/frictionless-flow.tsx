"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { MessageCircle, Clock, Target, Calendar } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

export function FrictionlessFlow() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 150,
    duration: 700,
    distance: 40,
  })
  const lineRef = React.useRef<HTMLDivElement>(null)
  const [lineHeight, setLineHeight] = React.useState(0)

  React.useEffect(() => {
    const line = lineRef.current
    if (!line) return

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      setLineHeight(100)
      return
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Dynamically import anime.js
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
    { icon: MessageCircle, text: t("home.flow.steps.1") },
    { icon: Clock, text: t("home.flow.steps.2") },
    { icon: Target, text: t("home.flow.steps.3") },
    { icon: Calendar, text: t("home.flow.steps.4") },
  ]

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Vertical animated line */}
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border overflow-hidden">
        <div
          ref={lineRef}
          className="w-full h-full bg-gradient-to-b from-primary via-accent to-gradient-to origin-top scale-y-0"
          style={{ transformOrigin: "top" }}
        />
      </div>

      {/* Steps with stagger */}
      <ul ref={staggerRef as React.RefObject<HTMLUListElement>} className="space-y-12 relative">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <li
              key={index}
              data-stagger-item
              className="flex items-start gap-6 relative"
            >
              {/* Number badge */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gradient-to flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg dark:glow-primary z-10">
                {index + 1}
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 hover:border-primary hover:shadow-xl transition-all dark:hover:glow-md">
                <div className="flex items-center gap-4 mb-3">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                  <p className="text-base font-medium text-foreground leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
