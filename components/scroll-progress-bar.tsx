"use client"

import * as React from "react"
import { useLenis } from "@/components/providers/lenis-provider"

export function ScrollProgressBar() {
  const [progress, setProgress] = React.useState(0)
  const { lenis, isEnabled } = useLenis()

  interface LenisScrollEvent {
    scroll: number
    limit: number
  }

  React.useEffect(() => {
    if (!isEnabled) {
      // Fallback to native scroll
      const handleScroll = () => {
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollTop = window.scrollY
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100
        setProgress(Math.min(100, Math.max(0, scrollPercent)))
      }

      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }

    if (lenis) {
      // Use Lenis scroll events
      const handleScroll = (e: LenisScrollEvent) => {
        const scrollPercent = (e.scroll / (e.limit || 1)) * 100
        setProgress(Math.min(100, Math.max(0, scrollPercent)))
      }

      lenis.on("scroll", handleScroll)
      return () => lenis.off("scroll", handleScroll)
    }
  }, [lenis, isEnabled])

  return (
    <progress
      className="scroll-progress fixed top-0 left-0 right-0 z-[100] h-1 w-full pointer-events-none"
      value={progress}
      max={100}
      aria-label="Scroll progress"
    />
  )
}
