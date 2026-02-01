"use client"

import * as React from "react"

interface UseMountAnimationOptions {
  delay?: number
  duration?: number
  distance?: number
  easing?: string
}

export function useMountAnimation(options: UseMountAnimationOptions = {}) {
  const {
    delay = 0,
    duration = 800,
    distance = 30,
    easing = "easeOutCubic",
  } = options

  const elementRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      // Just make it visible without animation
      element.style.opacity = "1"
      element.style.transform = "none"
      return
    }

    // Set initial state
    element.style.opacity = "0"
    element.style.transform = `translateY(${distance}px)`

    // Animate on mount
    const animate = async () => {
      const { animate: animeAnimate } = await import("animejs")

      animeAnimate(element, {
        opacity: [0, 1],
        translateY: [distance, 0],
        duration,
        delay,
        ease: easing,
      })
    }

    animate()
  }, [delay, duration, distance, easing])

  return { ref: elementRef }
}
