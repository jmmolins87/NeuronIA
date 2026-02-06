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
      size="lg"
      className={cn(
        "h-12 box-border cursor-pointer border-2 border-primary/30 bg-background text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 dark:border-primary/20 dark:bg-transparent dark:hover:bg-primary/10 dark:hover:border-primary/40",
        className
      )}
    />
  )
}
