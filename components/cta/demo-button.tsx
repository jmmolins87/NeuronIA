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
        "gradient-border-ring cursor-pointer bg-background text-foreground hover:bg-background hover:text-foreground dark:bg-transparent dark:hover:bg-transparent",
        className
      )}
    />
  )
}
