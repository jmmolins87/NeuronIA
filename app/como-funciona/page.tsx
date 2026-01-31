"use client"

import { SiteShell } from "@/components/site-shell"
import { useTranslation } from "@/components/providers/i18n-provider"

export default function ComoFuncionaPage() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      <section className="container mx-auto max-w-screen-2xl px-4 py-16">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("howItWorks.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("howItWorks.description")}
          </p>
        </div>
      </section>
    </SiteShell>
  )
}
