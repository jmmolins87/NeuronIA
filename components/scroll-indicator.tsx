"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/providers/i18n-provider"

interface ScrollIndicatorProps {
  targetId?: string
  className?: string
  showOnMobile?: boolean
}

export function ScrollIndicator({
  targetId,
  className,
  showOnMobile = false,
}: ScrollIndicatorProps) {
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
        showOnMobile
          ? "group flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-110"
          : "group hidden flex-col items-center gap-2 cursor-pointer transition-all hover:scale-110 sm:flex",
        className
      )}
      aria-label={t("common.scrollDown")}
    >
      <div className="text-xs font-semibold text-muted-foreground group-hover:text-gradient-to dark:group-hover:text-primary transition-colors sm:text-sm sm:font-medium">
        {t("common.scrollDown")}
      </div>
      <div className="relative h-11 w-7 rounded-full border-2 border-muted-foreground group-hover:border-gradient-to dark:group-hover:border-primary transition-colors sm:h-10 sm:w-6">
        <div className="absolute top-2 left-1/2 h-2 w-0.5 rounded-full bg-muted-foreground group-hover:bg-gradient-to dark:group-hover:bg-primary animate-scroll-down" />
      </div>
    </button>
  )
}
