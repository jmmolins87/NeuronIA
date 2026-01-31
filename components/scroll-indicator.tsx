"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/providers/i18n-provider"

interface ScrollIndicatorProps {
  targetId?: string
  className?: string
}

export function ScrollIndicator({ targetId, className }: ScrollIndicatorProps) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } else {
      // Scroll one viewport down
      window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex flex-col items-center gap-2 transition-all hover:scale-110 cursor-pointer",
        className
      )}
      aria-label={t("common.scrollDown")}
    >
      <div className="text-sm font-medium text-muted-foreground group-hover:text-gradient-to dark:group-hover:text-primary transition-colors">
        {t("common.scrollDown")}
      </div>
      <div className="relative w-6 h-10 rounded-full border-2 border-muted-foreground group-hover:border-gradient-to dark:group-hover:border-primary transition-colors">
        <div className="absolute top-2 left-1/2 w-0.5 h-2 bg-muted-foreground group-hover:bg-gradient-to dark:group-hover:bg-primary rounded-full animate-scroll-down" />
      </div>
    </button>
  )
}
