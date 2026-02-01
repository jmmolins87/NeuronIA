"use client"

import * as React from "react"
import { useRevealOnView } from "@/hooks/use-reveal-on-view"

interface RevealSectionProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function RevealSection({
  children,
  delay = 0,
  duration = 800,
  distance = 30,
  className,
}: RevealSectionProps) {
  const { ref } = useRevealOnView({ delay, duration, distance })

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={className}>
      {children}
    </section>
  )
}
