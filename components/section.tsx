import * as React from "react"
import { cn } from "@/lib/utils"

type SectionVariant = "default" | "card" | "muted" | "alt"

interface SectionProps {
  children: React.ReactNode
  className?: string
  variant?: SectionVariant
  id?: string
}

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-background",
  card: "bg-card",
  muted: "bg-muted",
  alt: "bg-section-alt",
}

export function Section({
  children,
  className,
  variant = "default",
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        // Add scroll margin to account for sticky header (h-16 = 64px)
        id && "scroll-mt-16",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </section>
  )
}
