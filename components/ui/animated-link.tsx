import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type AnimatedLinkProps = React.ComponentProps<typeof Link>

function AnimatedLink({ className, ...props }: AnimatedLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "relative inline-flex items-center gap-1 text-foreground transition-colors duration-300 ease-out focus-visible:outline-none after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-linear-to-r after:from-primary after:to-accent after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100",
        className
      )}
    />
  )
}

export { AnimatedLink }
