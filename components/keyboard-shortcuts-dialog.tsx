"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useKeyboardShortcuts } from "@/components/providers/keyboard-shortcuts-provider"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Keyboard } from "lucide-react"

export function KeyboardShortcutsDialog() {
  const { shortcuts, isHelpOpen, hideHelp } = useKeyboardShortcuts()
  const { t } = useTranslation()

  const navigationShortcuts = shortcuts.filter((s) => s.category === "navigation")
  const actionShortcuts = shortcuts.filter((s) => s.category === "actions")

  return (
    <Dialog open={isHelpOpen} onOpenChange={(open: boolean) => !open && hideHelp()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            {t("shortcuts.title")}
          </DialogTitle>
          <DialogDescription>
            {t("shortcuts.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-to dark:text-primary">
              {t("shortcuts.categories.navigation")}
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm text-foreground">
                    {t(shortcut.description)}
                  </span>
                  <kbd className="px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-gradient-from to-gradient-to rounded shadow-sm">
                    {Array.isArray(shortcut.keys) ? shortcut.keys[0] : shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Action Shortcuts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gradient-to dark:text-primary">
              {t("shortcuts.categories.actions")}
            </h3>
            <div className="space-y-2">
              {actionShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="text-sm text-foreground">
                    {t(shortcut.description)}
                  </span>
                  <kbd className="px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-gradient-from to-gradient-to rounded shadow-sm">
                    {Array.isArray(shortcut.keys) ? shortcut.keys[0] : shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          <p className="text-sm text-muted-foreground text-center pt-4 border-t">
            {t("shortcuts.hint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
