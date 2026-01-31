import * as React from "react"

import { cn } from "@/lib/utils"

interface AuroraFieldProps {
  className?: string
  intensity?: "soft" | "medium" | "strong"
}

const intensityClasses: Record<NonNullable<AuroraFieldProps["intensity"]>, string> = {
  soft: "opacity-40",
  medium: "opacity-60",
  strong: "opacity-80",
}

export function AuroraField({
  className,
  intensity = "medium",
}: AuroraFieldProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden="true"
    >
      <div className={cn("aurora-layer", intensityClasses[intensity])} />
      <div className={cn("aurora-layer-2", intensityClasses[intensity])} />
      <div className={cn("aurora-layer-3", intensityClasses[intensity])} />
    </div>
  )
}
