import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RoiButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.JSX.Element {
  return (
      <Button
        {...props}
        variant="default"
        className={cn(
          "box-border cursor-pointer border-2 border-transparent dark:glow-primary",
          className
        )}
      />
  )
}
