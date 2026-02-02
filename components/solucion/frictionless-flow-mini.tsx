"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { MessageCircle, CheckCircle, Calendar, Sparkles } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [MessageCircle, CheckCircle, Calendar, Sparkles]

export function FrictionlessFlowMini() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 120,
    duration: 650,
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

  const items = [
    t("solution.flow.items.0"),
    t("solution.flow.items.1"),
    t("solution.flow.items.2"),
    t("solution.flow.items.3"),
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

      {/* Flow items with stagger */}
      <ul
        ref={staggerRef as React.RefObject<HTMLUListElement>}
        className="space-y-8 relative"
      >
        {items.map((item, index) => {
          const Icon = icons[index]

          return (
            <li
              key={index}
              data-stagger-item
              className="flex items-center gap-4 relative"
            >
              {/* Icon badge */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gradient-to flex items-center justify-center text-primary-foreground shadow-lg dark:glow-primary z-10">
                <Icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border-2 border-border bg-card/90 backdrop-blur-xl p-4 hover:border-primary transition-all">
                <p className="text-base font-medium text-foreground/90 dark:text-foreground/95">
                  {item}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
