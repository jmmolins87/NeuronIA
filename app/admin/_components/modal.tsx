"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CancelButton } from "@/components/cta/cancel-button"
import { cn } from "@/lib/utils"

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  bodyScroll = "auto",
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
  bodyClassName?: string
  bodyScroll?: "auto" | "none"
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "max-h-[80vh] overflow-hidden overflow-x-hidden",
          "grid-rows-[auto_minmax(0,1fr)_auto]",
          "shadow-lg shadow-black/10 dark:shadow-black/40",
          "shadow-[0_0_40px_oklch(var(--secondary)/0.10)] dark:shadow-[0_0_40px_oklch(var(--primary)/0.14)]",
          contentClassName
        )}
      >
        <div className="relative">
          <div
            aria-hidden
            className="-mx-6 -mt-6 mb-1 h-1 bg-gradient-to-r from-secondary via-gradient-purple to-gradient-to dark:from-primary dark:via-gradient-to dark:to-primary"
          />

          <DialogClose asChild>
            <CancelButton
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              aria-label="Cerrar"
            >
              <XIcon className="size-4" />
            </CancelButton>
          </DialogClose>

          <DialogHeader className="pr-10 pt-2">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        </div>

        <div
          className={cn(
            "min-w-0 min-h-0 pr-4 break-words [overflow-wrap:anywhere]",
            bodyScroll === "auto" ? "overflow-auto overflow-x-hidden" : "overflow-hidden",
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
