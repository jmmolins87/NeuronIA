import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BorderButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
    <Button
      {...props}
      variant="outline"
      className={cn(
        "box-border cursor-pointer border-2 border-primary/50 bg-transparent text-foreground hover:bg-transparent hover:border-primary dark:border-primary/40 dark:hover:bg-transparent dark:hover:border-primary",
        className
      )}
    />
  )
}
