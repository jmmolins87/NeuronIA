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
        "gradient-border-transparent cursor-pointer bg-transparent text-foreground hover:bg-transparent hover:text-foreground active:bg-transparent",
        className
      )}
    />
  )
}
