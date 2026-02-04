import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DemoButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
    <Button
      {...props}
      variant="ghost"
      className={cn(
        "cursor-pointer border-2 border-border/60 bg-transparent text-foreground hover:bg-transparent hover:border-border active:bg-transparent",
        className
      )}
    />
  )
}
