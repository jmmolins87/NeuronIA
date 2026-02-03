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

export function ThemeToggle({ size = "default" }: { size?: "default" | "large" }) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const iconSize = size === "large" ? "w-8 h-8" : "h-6 w-6"

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className={iconSize} />
      case "dark":
        return <Moon className={iconSize} />
      case "system":
        return <Monitor className={iconSize} />
      default:
        return <Sun className={iconSize} />
    }
  }

  if (!mounted) {
    if (size === "large") {
      return (
        <div className="flex items-center justify-center p-2 rounded-lg bg-transparent opacity-50">
          <Sun className={iconSize} />
        </div>
      )
    }
    return (
      <Button
        variant="ghost"
        className="h-12 w-12 flex items-center justify-center"
        disabled
      >
        <Sun className={iconSize} />
      </Button>
    )
  }

  if (size === "large") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center justify-center p-4 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
              isOpen ? "bg-gradient-to/10 text-gradient-to dark:bg-primary/10 dark:text-primary" : ""
            }`}
            aria-label={t("aria.toggleTheme")}
          >
            {getThemeIcon()}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="top" 
          align="center" 
          className="min-w-[120px] origin-bottom fan-open"
        >
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
          >
            <Sun className="h-7 w-7 mb-2" />
            <span className="text-sm font-medium">{t("theme.light")}</span>
            {theme === "light" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
          >
            <Moon className="h-7 w-7 mb-2" />
            <span className="text-sm font-medium">{t("theme.dark")}</span>
            {theme === "dark" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
          >
            <Monitor className="h-7 w-7 mb-2" />
            <span className="text-sm font-medium">{t("theme.system")}</span>
            {theme === "system" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 w-12 flex items-center justify-center cursor-pointer transition-colors"
          aria-label={t("aria.toggleTheme")}
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="top" 
        align="center" 
        className="min-w-[120px] origin-bottom fan-open"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Sun className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">{t("theme.light")}</span>
          {theme === "light" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Moon className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">{t("theme.dark")}</span>
          {theme === "dark" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer flex flex-col items-center justify-center py-4 relative"
        >
          <Monitor className="h-7 w-7 mb-2" />
          <span className="text-sm font-medium">{t("theme.system")}</span>
          {theme === "system" && <span className="absolute top-2 right-2 text-gradient-to dark:text-primary text-sm">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
