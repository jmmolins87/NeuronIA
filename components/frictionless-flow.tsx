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
    { 
      icon: MessageCircle, 
      title: t("home.flow.steps.1.title"),
      description: t("home.flow.steps.1.description")
    },
    { 
      icon: Clock, 
      title: t("home.flow.steps.2.title"),
      description: t("home.flow.steps.2.description")
    },
    { 
      icon: Target, 
      title: t("home.flow.steps.3.title"),
      description: t("home.flow.steps.3.description")
    },
    { 
      icon: Calendar, 
      title: t("home.flow.steps.4.title"),
      description: t("home.flow.steps.4.description")
    },
  ]

  return (
    <div className="max-w-2xl lg:max-w-6xl mx-auto relative">
      {/* Vertical animated line - Hidden in desktop */}
      <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border overflow-hidden lg:hidden">
        <div
          ref={lineRef}
          className="w-full h-full bg-gradient-to-b from-primary via-accent to-gradient-to origin-top scale-y-0"
          style={{ transformOrigin: "top" }}
        />
      </div>

      {/* Steps with stagger - Grid 2x2 on desktop */}
      <ul ref={staggerRef as React.RefObject<HTMLUListElement>} className="space-y-12 lg:grid lg:grid-cols-2 lg:gap-8 relative">
        {steps.map((step, index) => {
          const Icon = step.icon
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
              <div className="flex-1 rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 hover:border-primary hover:shadow-xl transition-all dark:hover:glow-md">
                <div className="flex items-start gap-4">
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <p className="text-base lg:text-lg font-semibold text-foreground leading-tight">
                      {step.title}
                    </p>
                    <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                      {step.description}
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
