"use client"

import * as React from "react"

import { KEYBOARD_SHORTCUTS } from "@/lib/keyboard-shortcuts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslation } from "@/components/providers/i18n-provider"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("shortcuts.title")}
          </DialogTitle>
          <DialogDescription>{t("shortcuts.description")}</DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3"
            >
              <span className="text-sm text-foreground">
                {t(`shortcuts.items.${shortcut.id}`)}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, index) => (
                  <React.Fragment key={`${shortcut.id}-${key}-${index}`}>
                    <kbd className="rounded-md border border-border/60 bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
                      {key}
                    </kbd>
                    {index < shortcut.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">
                        {t("shortcuts.then")}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {t("shortcuts.hint")}
        </p>
      </DialogContent>
    </Dialog>
  )
}

export { KeyboardShortcutsDialog }
