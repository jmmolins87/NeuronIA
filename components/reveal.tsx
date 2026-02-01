"use client"

import * as React from "react"
import { useRevealOnView } from "@/hooks/use-reveal-on-view"

interface RevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function Reveal({
  children,
  delay = 0,
  duration = 800,
  distance = 30,
  className,
}: RevealProps) {
  const { ref } = useRevealOnView({ delay, duration, distance })

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </div>
  )
}
