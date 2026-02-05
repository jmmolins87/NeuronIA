import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer box-border border-2 border-transparent items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gradient-from to-gradient-to text-primary-foreground transition-all duration-700 ease-in-out hover:from-gradient-to hover:to-gradient-from hover:shadow-lg dark:shadow-[0_0_25px_oklch(var(--gradient-from)/0.4),0_0_50px_oklch(var(--gradient-to)/0.3)] dark:hover:shadow-[0_0_35px_oklch(var(--gradient-to)/0.6),0_0_70px_oklch(var(--gradient-from)/0.5)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 transition-colors duration-300",
        outline:
          "relative border-2 border-transparent bg-background bg-clip-padding before:absolute before:inset-0 before:-z-10 before:m-[-2px] before:rounded-[inherit] before:bg-gradient-to-br before:from-gradient-from before:to-gradient-to before:transition-all before:duration-700 before:ease-in-out hover:before:from-gradient-to hover:before:to-gradient-from shadow-xs transition-all duration-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-300",
        ghost:
          "hover:bg-gradient-to/10 hover:text-gradient-to dark:hover:bg-primary/10 dark:hover:text-primary transition-colors duration-300",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
