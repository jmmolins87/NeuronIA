"use client"

import * as React from "react"
import { useLenis } from "@/components/providers/lenis-provider"

interface UseParallaxOptions {
  speed?: number
  direction?: "up" | "down"
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, direction = "up" } = options
  const elementRef = React.useRef<HTMLElement>(null)
  const { lenis, isEnabled } = useLenis()

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const handleScroll = () => {
      if (!element) return

      const rect = element.getBoundingClientRect()
      const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      const parallaxValue = scrollProgress * 100 * speed

      const transform = direction === "up" 
        ? `translateY(-${parallaxValue}px)` 
        : `translateY(${parallaxValue}px)`

      element.style.transform = transform
    }

    if (!isEnabled || !lenis) {
      // Fallback to native scroll
      window.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll()
      return () => window.removeEventListener("scroll", handleScroll)
    }

    // Use Lenis scroll events
    lenis.on("scroll", handleScroll)
    handleScroll()
    return () => lenis.off("scroll", handleScroll)
  }, [lenis, isEnabled, speed, direction])

  return { ref: elementRef }
}
