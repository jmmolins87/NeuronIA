"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

// Temporary stub - will be replaced with i18n in Phase 2
export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = React.useState("ES")

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === "ES" ? "EN" : "ES"))
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-9 gap-2"
      aria-label="Change language"
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">{currentLang}</span>
    </Button>
  )
}
