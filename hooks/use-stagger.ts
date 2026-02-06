"use client"

import * as React from "react"

interface UseStaggerOptions {
  delay?: number
  stagger?: number
  duration?: number
  distance?: number
  easing?: string
  threshold?: number
  triggerOnce?: boolean
}

export function useStagger(options: UseStaggerOptions = {}) {
  const {
    delay = 0,
    stagger = 100,
    duration = 600,
    distance = 30,
    easing = "easeOutCubic",
    threshold = 0.05,
    triggerOnce = false,
  } = options

  const containerRef = React.useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

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
    const container = containerRef.current
    if (!container) return

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      // Just make children visible without animation
      const children = container.querySelectorAll("[data-stagger-item]")
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.opacity = "1"
          child.style.transform = "none"
        }
      })
      return
    }

    // Set initial state for all children
    const children = container.querySelectorAll("[data-stagger-item]")
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.opacity = "0"
        child.style.transform = `translateY(${distance}px)`
      }
    })

    if (typeof IntersectionObserver === "undefined") {
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.opacity = "1"
          child.style.transform = "none"
        }
      })
      return
    }

    // IntersectionObserver
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          const animate = await loadAnimeAnimate()

          if (entry.isIntersecting) {
            setIsVisible(true)

            // Animate children with stagger - entering
            try {
              if (!animate) {
                children.forEach((child) => {
                  if (child instanceof HTMLElement) {
                    child.style.opacity = "1"
                    child.style.transform = "none"
                  }
                })
              } else {
                children.forEach((child, index) => {
                  animate(child, {
                    opacity: [0, 1],
                    translateY: [distance, 0],
                    duration,
                    delay: delay + (index * stagger),
                    ease: easing,
                  })
                })
              }
            } catch {
              children.forEach((child) => {
                if (child instanceof HTMLElement) {
                  child.style.opacity = "1"
                  child.style.transform = "none"
                }
              })
            }

            if (triggerOnce) {
              observer.unobserve(container)
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
            
            // Animate children with stagger - leaving
            try {
              if (animate) {
                children.forEach((child, index) => {
                  animate(child, {
                    opacity: [1, 0],
                    translateY: [0, distance / 2],
                    duration: duration * 0.6,
                    delay: index * (stagger / 2),
                    ease: easing,
                  })
                })
              }
            } catch {
              // If animation fails, keep items visible.
              children.forEach((child) => {
                if (child instanceof HTMLElement) {
                  child.style.opacity = "1"
                  child.style.transform = "none"
                }
              })
            }
          }
        }
      },
      { threshold }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [delay, stagger, duration, distance, easing, threshold, triggerOnce])

  return { ref: containerRef, isVisible }
}
