"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Mousetrap from "mousetrap"

import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { KEYBOARD_SHORTCUTS } from "@/lib/keyboard-shortcuts"

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode
}

function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const mousetrapWithPrototype = Mousetrap as typeof Mousetrap & {
      prototype: {
        stopCallback: (
          event: KeyboardEvent,
          element: HTMLElement,
          combo: string
        ) => boolean
      }
    }

    const previousStopCallback = mousetrapWithPrototype.prototype.stopCallback

    mousetrapWithPrototype.prototype.stopCallback = (
      event,
      element,
      combo
    ) => {
      if (!element) return false
      const tagName = element.tagName.toLowerCase()
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        element.isContentEditable
      ) {
        return true
      }
      return previousStopCallback
        ? previousStopCallback.call(mousetrapWithPrototype, event, element, combo)
        : false
    }

    return () => {
      mousetrapWithPrototype.prototype.stopCallback = previousStopCallback
    }
  }, [])

  React.useEffect(() => {
    KEYBOARD_SHORTCUTS.forEach((shortcut) => {
      if (shortcut.id === "openHelp") {
        Mousetrap.bind(shortcut.sequence, () => {
          setOpen(true)
          return false
        })
        return
      }

      if (typeof shortcut.route === "string") {
        const route = shortcut.route
        Mousetrap.bind(shortcut.sequence, () => {
          router.push(route)
          return false
        })
      }
    })

    return () => {
      KEYBOARD_SHORTCUTS.forEach((shortcut) => {
        Mousetrap.unbind(shortcut.sequence)
      })
    }
  }, [router])

  return (
    <>
      {children}
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export { KeyboardShortcutsProvider }
