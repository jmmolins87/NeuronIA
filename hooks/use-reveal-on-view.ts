"use client"

import * as React from "react"

interface UseRevealOnViewOptions {
  delay?: number
  duration?: number
  distance?: number
  easing?: string
  threshold?: number
  triggerOnce?: boolean
}

export function useRevealOnView(
  options: UseRevealOnViewOptions = {}
) {
  const {
    delay = 0,
    duration = 800,
    distance = 30,
    easing = "easeOutCubic",
    threshold = 0.05,
    triggerOnce = false,
  } = options

  const elementRef = React.useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)
  const hasAnimated = React.useRef(false)

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

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            if (triggerOnce && hasAnimated.current) return

            setIsVisible(true)
            hasAnimated.current = true

            // Dynamically import anime.js
            const { animate } = await import("animejs")

            // Animate with Anime.js
            animate(element, {
              opacity: [0, 1],
              translateY: [distance, 0],
              duration,
              delay,
              ease: easing,
            })

            if (triggerOnce) {
              observer.unobserve(element)
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
            const { animate } = await import("animejs")
            animate(element, {
              opacity: [1, 0],
              translateY: [0, distance],
              duration: duration * 0.6,
              ease: easing,
            })
          }
        })
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [delay, duration, distance, easing, threshold, triggerOnce])

  return { ref: elementRef, isVisible }
}
