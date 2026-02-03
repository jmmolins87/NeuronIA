"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { MessageSquare, Database, CheckCircle, FileText } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [MessageSquare, Database, CheckCircle, FileText]

export function StepsTimeline() {
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
              duration: 1800,
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
    {
      title: t("howItWorks.steps.items.0.title"),
      text: t("howItWorks.steps.items.0.text"),
    },
    {
      title: t("howItWorks.steps.items.1.title"),
      text: t("howItWorks.steps.items.1.text"),
    },
    {
      title: t("howItWorks.steps.items.2.title"),
      text: t("howItWorks.steps.items.2.text"),
    },
    {
      title: t("howItWorks.steps.items.3.title"),
      text: t("howItWorks.steps.items.3.text"),
    },
  ]

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto relative">
      {/* Vertical animated line - Mobile/Tablet only */}
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border overflow-hidden lg:hidden">
        <div
          ref={lineRef}
          className="w-full h-full bg-gradient-to-b from-primary via-accent to-gradient-to origin-top scale-y-0"
        />
      </div>

      {/* Steps with stagger */}
      <ul
        ref={staggerRef as React.RefObject<HTMLUListElement>}
        className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 lg:items-stretch relative"
      >
        {steps.map((step, index) => {
          const Icon = icons[index]
          return (
            <li
              key={index}
              data-stagger-item
              className="flex items-start gap-4 lg:gap-5 relative lg:h-full"
            >
              {/* Number badge */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-gradient-to flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg dark:glow-primary z-10">
                {index + 1}
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-xl border-2 border-border bg-card/90 backdrop-blur-xl p-6 hover:border-primary hover:shadow-xl transition-all dark:hover:glow-md lg:h-full lg:flex lg:flex-col">
                <div className="flex items-start gap-4 lg:flex-1">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg lg:text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
                      {step.text}
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
