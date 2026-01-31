"use client"

import { SiteShell } from "@/components/site-shell"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useTranslation } from "@/components/providers/i18n-provider"

export default function Home() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      <section className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-4xl space-y-8">
          {/* Logo grande */}
          <div className="flex justify-center">
            <Logo 
              width={800} 
              height={200} 
              className="h-32 w-auto sm:h-40 md:h-48 lg:h-56 xl:h-64" 
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("home.hero.title")}{" "}
            <span className="text-primary dark:text-glow-primary">{t("home.hero.titleHighlight")}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/reservar">{t("home.hero.cta1")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/roi">{t("home.hero.cta2")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
