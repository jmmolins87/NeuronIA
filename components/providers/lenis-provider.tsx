"use client"

import * as React from "react"
import Lenis from "lenis"

interface LenisProviderProps {
  children: React.ReactNode
}

function LenisProvider({ children }: LenisProviderProps) {
  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) return

    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

export { LenisProvider }
