import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NeonButtonProps = React.ComponentProps<typeof Button>

function NeonButton({ className, ...props }: NeonButtonProps) {
  return (
    <Button
      {...props}
      className={cn(
        "relative overflow-hidden bg-linear-to-r from-primary to-accent text-primary-foreground shadow-[0_10px_28px_oklch(var(--glow)/0.25)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:from-accent hover:to-primary hover:shadow-[0_14px_36px_oklch(var(--glow)/0.35)] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background after:pointer-events-none after:absolute after:inset-0 after:translate-x-[-120%] after:bg-linear-to-r after:from-transparent after:via-accent/40 after:to-transparent after:opacity-0 after:transition-all after:duration-700 hover:after:translate-x-[120%] hover:after:opacity-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:after:hidden",
        className
      )}
    />
  )
}

export { NeonButton }
