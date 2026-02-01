"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useParallax } from "@/hooks/use-parallax"

interface BlobShapeProps {
  className?: string
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  color?: "primary" | "accent" | "gradient"
  parallax?: boolean
  parallaxSpeed?: number
}

const positionClasses = {
  "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
  "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
}

const colorClasses = {
  primary: "bg-primary",
  accent: "bg-accent",
  gradient: "bg-gradient-to-br from-gradient-from to-gradient-to",
}

export function BlobShape({
  className,
  position = "top-right",
  color = "primary",
  parallax = false,
  parallaxSpeed = 0.3,
}: BlobShapeProps) {
  const { ref } = useParallax({ 
    speed: parallaxSpeed,
    direction: position.includes("top") ? "up" : "down"
  })

  return (
    <div
      ref={parallax ? (ref as React.RefObject<HTMLDivElement>) : undefined}
      className={cn(
        "absolute pointer-events-none opacity-20 dark:opacity-30",
        "w-96 h-96 rounded-full blur-3xl",
        "dark:glow-md",
        "animate-blob-float",
        colorClasses[color],
        positionClasses[position],
        className
      )}
      aria-hidden="true"
    />
  )
}
