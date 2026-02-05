import * as React from "react"

import { cn } from "@/lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning"
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-primary text-primary-foreground border-transparent",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-transparent",
        variant === "outline" && "bg-transparent text-foreground border-border",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground border-transparent",
        variant === "success" &&
          "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
        variant === "warning" &&
          "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:text-amber-300",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
