"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  contentId: string
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext(): PopoverContextValue {
  const value = React.useContext(PopoverContext)
  if (!value) throw new Error("Popover components must be used within <Popover>")
  return value
}

export interface PopoverProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Popover({ open, defaultOpen, onOpenChange, children, className }: PopoverProps) {
  const [uncontrolled, setUncontrolled] = React.useState(Boolean(defaultOpen))
  const isControlled = typeof open === "boolean"
  const isOpen = isControlled ? Boolean(open) : uncontrolled

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const contentId = React.useId()
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!isOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }

    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node | null
      if (!target) return
      if (contentRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onMouseDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onMouseDown)
    }
  }, [isOpen, setOpen])

  const value = React.useMemo<PopoverContextValue>(
    () => ({ open: isOpen, setOpen, contentId, triggerRef, contentRef }),
    [contentId, isOpen, setOpen]
  )

  return (
    <PopoverContext.Provider value={value}>
      <div className={cn("relative inline-flex", className)}>{children}</div>
    </PopoverContext.Provider>
  )
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild, onClick, ...props }, forwardedRef) => {
    const { open, setOpen, contentId, triggerRef } = usePopoverContext()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={(node: HTMLElement | null) => {
          triggerRef.current = node
          if (!forwardedRef) return
          if (typeof forwardedRef === "function") forwardedRef(node as unknown as HTMLButtonElement)
          else forwardedRef.current = node as unknown as HTMLButtonElement
        }}
        type={asChild ? undefined : "button"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e)
          if (e.defaultPrevented) return
          setOpen(!open)
        }}
        {...props}
      />
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "center", ...props }, ref) => {
    const { open, contentId, contentRef } = usePopoverContext()
    if (!open) return null

    const alignClass =
      align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"

    return (
      <div
        id={contentId}
        ref={(node) => {
          contentRef.current = node
          if (!ref) return
          if (typeof ref === "function") ref(node)
          else ref.current = node
        }}
        role="dialog"
        className={cn(
          "absolute z-50 mt-2 w-[min(92vw,360px)] rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none",
          alignClass,
          className
        )}
        {...props}
      />
    )
  }
)
PopoverContent.displayName = "PopoverContent"
