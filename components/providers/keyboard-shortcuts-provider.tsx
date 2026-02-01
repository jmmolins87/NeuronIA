"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Mousetrap from "mousetrap"

export interface KeyboardShortcut {
  keys: string | string[]
  description: string
  action: () => void
  category: "navigation" | "actions"
}

interface KeyboardShortcutsContextValue {
  shortcuts: KeyboardShortcut[]
  showHelp: () => void
  hideHelp: () => void
  isHelpOpen: boolean
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextValue | undefined>(
  undefined
)

export function useKeyboardShortcuts() {
  const context = React.useContext(KeyboardShortcutsContext)
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider")
  }
  return context
}

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)

  const shortcuts: KeyboardShortcut[] = React.useMemo(
    () => [
      {
        keys: ["g r", "g then r"],
        description: "shortcuts.navigation.roi",
        action: () => router.push("/roi"),
        category: "navigation",
      },
      {
        keys: ["g s", "g then s"],
        description: "shortcuts.navigation.solution",
        action: () => router.push("/solucion"),
        category: "navigation",
      },
      {
        keys: ["g e", "g then e"],
        description: "shortcuts.navigation.scenarios",
        action: () => router.push("/escenarios"),
        category: "navigation",
      },
      {
        keys: ["g h", "g then h"],
        description: "shortcuts.navigation.home",
        action: () => router.push("/"),
        category: "navigation",
      },
      {
        keys: ["g c", "g then c"],
        description: "shortcuts.navigation.contact",
        action: () => router.push("/contacto"),
        category: "navigation",
      },
      {
        keys: ["g b", "g then b"],
        description: "shortcuts.navigation.book",
        action: () => router.push("/reservar"),
        category: "navigation",
      },
      {
        keys: "?",
        description: "shortcuts.actions.help",
        action: () => setIsHelpOpen(true),
        category: "actions",
      },
      {
        keys: "esc",
        description: "shortcuts.actions.closeHelp",
        action: () => setIsHelpOpen(false),
        category: "actions",
      },
    ],
    [router]
  )

  React.useEffect(() => {
    // Bind all shortcuts
    shortcuts.forEach((shortcut) => {
      const keys = Array.isArray(shortcut.keys) ? shortcut.keys[0] : shortcut.keys
      Mousetrap.bind(keys, (e) => {
        // Prevent default behavior
        e.preventDefault()
        
        // Don't trigger shortcuts if user is typing in an input
        const target = e.target as HTMLElement
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        ) {
          return false
        }

        shortcut.action()
        return false
      })
    })

    // Cleanup
    return () => {
      shortcuts.forEach((shortcut) => {
        const keys = Array.isArray(shortcut.keys) ? shortcut.keys[0] : shortcut.keys
        Mousetrap.unbind(keys)
      })
    }
  }, [shortcuts])

  const value = {
    shortcuts,
    showHelp: () => setIsHelpOpen(true),
    hideHelp: () => setIsHelpOpen(false),
    isHelpOpen,
  }

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  )
}
