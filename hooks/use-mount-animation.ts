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

  async function loadAnimeAnimate(): Promise<((...args: unknown[]) => unknown) | null> {
    try {
      const mod: unknown = await import("animejs")
      const anyMod = mod as { animate?: unknown; default?: unknown }
      const candidate =
        anyMod.animate ??
        (typeof anyMod.default === "object" && anyMod.default !== null
          ? (anyMod.default as { animate?: unknown }).animate
          : undefined) ??
        anyMod.default

      return typeof candidate === "function" ? (candidate as (...args: unknown[]) => unknown) : null
    } catch {
      return null
    }
  }

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
      try {
        const animeAnimate = await loadAnimeAnimate()
        if (!animeAnimate) {
          element.style.opacity = "1"
          element.style.transform = "none"
          return
        }

        animeAnimate(element, {
          opacity: [0, 1],
          translateY: [distance, 0],
          duration,
          delay,
          ease: easing,
        })
      } catch {
        element.style.opacity = "1"
        element.style.transform = "none"
      }
    }

    animate()
  }, [delay, duration, distance, easing])

  return { ref: elementRef }
}
