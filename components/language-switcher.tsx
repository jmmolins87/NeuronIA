"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "@/components/providers/i18n-provider"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation()

  const handleChange = (checked: boolean) => {
    setLocale(checked ? "en" : "es")
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium transition-colors ${locale === "es" ? "text-gradient-to dark:text-primary" : "text-muted-foreground"}`}>
        ES
      </span>
      <Switch
        checked={locale === "en"}
        onCheckedChange={handleChange}
        aria-label={t("aria.changeLanguage")}
        className="cursor-pointer"
      />
      <span className={`text-sm font-medium transition-colors ${locale === "en" ? "text-gradient-to dark:text-primary" : "text-muted-foreground"}`}>
        EN
      </span>
    </div>
  )
}
