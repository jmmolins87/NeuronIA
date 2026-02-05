"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { useTranslation } from "@/components/providers/i18n-provider"

export function ReagendarClient() {
  const params = useSearchParams()
  const { t, setLocale } = useTranslation()

  const token = params.get("token")
  const lang = params.get("lang")
  const status = params.get("status")
  const code = params.get("code")

  React.useEffect(() => {
    if (lang === "es" || lang === "en") setLocale(lang)
  }, [lang, setLocale])

  const isError = status === "error"

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-balance text-3xl font-bold tracking-tight">{t("common.bookDemo")}</h1>
      <p className="mt-3 text-pretty text-muted-foreground">{t("book.calendly.placeholder")}</p>

      {isError ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {t("errors.somethingWentWrong")} {code ? `(${code})` : ""}
        </p>
      ) : null}

      {token ? (
        <p className="mt-6 break-all rounded-md border border-border bg-card p-3 font-mono text-xs text-foreground">
          {token}
        </p>
      ) : null}

      <div className="mt-8">
        <Link className="text-sm font-semibold underline underline-offset-4" href="/">
          {t("common.back")}
        </Link>
      </div>
    </main>
  )
}
