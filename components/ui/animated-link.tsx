import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface AnimatedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  underline?: boolean
  neon?: boolean
}

const AnimatedLink = React.forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  ({ className, href, underline = true, neon = true, children, ...props }, ref) => {
    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "transition-colors",
          underline && "link-underline",
          neon && "text-gradient-to dark:text-primary hover:text-primary dark:hover:text-glow",
          !neon && "text-foreground hover:text-primary",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
AnimatedLink.displayName = "AnimatedLink"

export { AnimatedLink }
