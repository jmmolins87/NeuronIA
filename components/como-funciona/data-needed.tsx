"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { MessageSquare, Settings, Calendar, CheckCircle } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

const icons = [MessageSquare, Settings, Calendar, CheckCircle]

export function DataNeeded() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 120,
    duration: 650,
    distance: 40,
  })

  const items = [
    {
      title: t("howItWorks.data.items.0.title"),
      text: t("howItWorks.data.items.0.text"),
    },
    {
      title: t("howItWorks.data.items.1.title"),
      text: t("howItWorks.data.items.1.text"),
    },
    {
      title: t("howItWorks.data.items.2.title"),
      text: t("howItWorks.data.items.2.text"),
    },
    {
      title: t("howItWorks.data.items.3.title"),
      text: t("howItWorks.data.items.3.text"),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-lg text-center text-foreground/80 dark:text-foreground/90 mb-12 sm:text-xl">
        {t("howItWorks.data.lead")}
      </p>

      <ul
        ref={staggerRef as React.RefObject<HTMLUListElement>}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item, index) => {
          const Icon = icons[index]
          return (
            <li
              key={index}
              data-stagger-item
              className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm">
                  <Icon className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed">
                    {item.text}
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
