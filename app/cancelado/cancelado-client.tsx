"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { useTranslation } from "@/components/providers/i18n-provider"

export function CanceladoClient() {
  const params = useSearchParams()
  const { t, setLocale } = useTranslation()

  const status = params.get("status")
  const lang = params.get("lang")

  React.useEffect(() => {
    if (lang === "es" || lang === "en") setLocale(lang)
  }, [lang, setLocale])

  const ok = status === "ok"
  const title = ok ? t("contact.form.demoStatus.cancelled.title") : t("errors.somethingWentWrong")
  const message = ok ? t("contact.form.demoStatus.cancelled.message") : t("errors.tryAgain")

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-balance text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-pretty text-muted-foreground">{message}</p>
      <div className="mt-8">
        <Link className="text-sm font-semibold underline underline-offset-4" href="/">
          {t("common.back")}
        </Link>
      </div>
    </main>
  )
}
