"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useTheme } from "next-themes"

export default function Home() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determinar el theme actual (light o dark)
  const currentTheme = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light"

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

          {/* Claim dinámico según theme */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-gradient-to dark:text-primary">
              {t(`home.hero.claim.${currentTheme}`)}
            </span>
          </h1>

          {/* Mensaje clave */}
          <p className="mx-auto max-w-2xl text-xl font-medium text-foreground sm:text-2xl">
            {t("home.hero.keyMessage")}
          </p>

          {/* Micro-CTA con link a ROI */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            <Link 
              href="/roi" 
              className="text-gradient-to dark:text-primary hover:underline transition-colors"
            >
              {t("home.hero.microCTA")}
            </Link>
          </p>

          {/* CTAs principales */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-4">
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
