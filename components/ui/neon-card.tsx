import * as React from "react"

import { cn } from "@/lib/utils"

function NeonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neon-card"
      className={cn(
        "group relative z-10 overflow-hidden rounded-xl border border-border/70 bg-card/80 p-6 text-card-foreground shadow-sm backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_45px_oklch(var(--primary)/0.65),0_0_32px_oklch(var(--primary)/0.55)] focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/50 dark:hover:shadow-[0_22px_60px_oklch(var(--primary)/0.75),0_0_40px_oklch(var(--primary)/0.65)] motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function NeonCardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="neon-card-icon"
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-primary-foreground shadow-sm transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { NeonCard, NeonCardIcon }
