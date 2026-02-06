import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CancelButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
    <Button
      {...props}
      variant="ghost"
      size="lg"
      className={cn(
        "h-12 box-border cursor-pointer border-2 border-destructive bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 dark:hover:text-destructive",
        className
      )}
    />
  )
}
