"use client"

import * as React from "react"
import Lottie from "lottie-react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LottieIconProps {
  animationData: unknown
  fallbackIcon: LucideIcon
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottieIcon({
  animationData,
  fallbackIcon: FallbackIcon,
  className,
  loop = true,
  autoplay = true,
}: LottieIconProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (prefersReducedMotion) {
    return <FallbackIcon className={cn("w-8 h-8", className)} />
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={cn("w-16 h-16", className)}
    />
  )
}
