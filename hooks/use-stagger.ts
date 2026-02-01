"use client"

import * as React from "react"

interface UseStaggerOptions {
  delay?: number
  stagger?: number
  duration?: number
  distance?: number
  easing?: string
  threshold?: number
}

export function useStagger(options: UseStaggerOptions = {}) {
  const {
    delay = 0,
    stagger = 100,
    duration = 600,
    distance = 30,
    easing = "easeOutCubic",
    threshold = 0.1,
  } = options

  const containerRef = React.useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

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

    // IntersectionObserver
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)

            // Dynamically import anime.js
            const { animate, utils } = await import("animejs")

            // Animate children with stagger
            children.forEach((child, index) => {
              animate(child, {
                opacity: [0, 1],
                translateY: [distance, 0],
                duration,
                delay: delay + (index * stagger),
                ease: easing,
              })
            })

            observer.unobserve(container)
          }
        }
      },
      { threshold }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [delay, stagger, duration, distance, easing, threshold])

  return { ref: containerRef, isVisible }
}
