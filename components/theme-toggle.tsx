"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/components/providers/i18n-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 cursor-pointer transition-colors ${
            isOpen ? "bg-gradient-to/10 text-gradient-to dark:bg-primary/10 dark:text-primary" : ""
          }`}
          aria-label={t("aria.toggleTheme")}
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer flex flex-col items-center justify-center py-3 relative"
        >
          <Sun className="h-5 w-5 mb-1" />
          <span className="text-xs">{t("theme.light")}</span>
          {theme === "light" && <span className="absolute top-1 right-1 text-gradient-to dark:text-primary text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex flex-col items-center justify-center py-3 relative"
        >
          <Moon className="h-5 w-5 mb-1" />
          <span className="text-xs">{t("theme.dark")}</span>
          {theme === "dark" && <span className="absolute top-1 right-1 text-gradient-to dark:text-primary text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer flex flex-col items-center justify-center py-3 relative"
        >
          <Monitor className="h-5 w-5 mb-1" />
          <span className="text-xs">{t("theme.system")}</span>
          {theme === "system" && <span className="absolute top-1 right-1 text-gradient-to dark:text-primary text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
