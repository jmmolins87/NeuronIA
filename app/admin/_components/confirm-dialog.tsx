"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { CancelButton } from "@/components/cta/cancel-button"
import { Modal } from "@/app/admin/_components/modal"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm?: () => void
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="sm:max-w-lg"
      footer={
        <>
          <CancelButton
            type="button"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel ?? "Cerrar"}
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
        Esta accion es solo UI (mock).
      </div>
    </Modal>
  )
}
