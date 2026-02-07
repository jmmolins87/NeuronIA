"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltipContext(): TooltipContextValue {
  const value = React.useContext(TooltipContext)
  if (!value) throw new Error("Tooltip components must be used within <Tooltip>")
  return value
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo(() => ({ open, setOpen }), [open])
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
}

export interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
}

export const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ asChild, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
    const { setOpen } = useTooltipContext()
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        ref={ref}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
          onMouseEnter?.(e)
          setOpen(true)
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
          onMouseLeave?.(e)
          setOpen(false)
        }}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          onFocus?.(e)
          setOpen(true)
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          onBlur?.(e)
          setOpen(false)
        }}
        {...props}
      />
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom"
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", ...props }, ref) => {
    const { open } = useTooltipContext()
    if (!open) return null

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 max-w-[260px] rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none",
          side === "top"
            ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
            : "top-full left-1/2 mt-2 -translate-x-1/2",
          className
        )}
        {...props}
      />
    )
  }
)
TooltipContent.displayName = "TooltipContent"
