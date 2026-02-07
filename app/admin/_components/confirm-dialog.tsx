"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { CancelButton } from "@/components/cta/cancel-button"
import { Modal } from "@/components/modal"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Close",
  closeAriaLabel = "Close",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  closeAriaLabel?: string
  onConfirm?: () => void
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="sm:max-w-lg"
      closeAriaLabel={closeAriaLabel}
      footer={
        <>
          <CancelButton
            type="button"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </CancelButton>
          <Button
            type="button"
            onClick={() => {
              onConfirm?.()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-muted-foreground text-sm">
        This action is UI only (mock).
      </div>
    </Modal>
  )
}
