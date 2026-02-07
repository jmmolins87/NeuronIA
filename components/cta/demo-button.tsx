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
      size="lg"
      className={cn(
        "h-12 bg-sky-50 text-black hover:bg-sky-100 dark:bg-black dark:text-white dark:hover:bg-neutral-900",
        className
      )}
    />
  )
}
