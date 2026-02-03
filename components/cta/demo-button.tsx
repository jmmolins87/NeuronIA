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
      variant="outline"
      className={cn(
        "cursor-pointer bg-foreground text-background hover:bg-foreground/90 dark:bg-background dark:text-foreground dark:hover:bg-background/90",
        className
      )}
    />
  )
}
