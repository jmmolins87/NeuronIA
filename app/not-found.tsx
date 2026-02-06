"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useMounted } from "@/hooks/use-mounted"
import { DemoButton } from "@/components/cta/demo-button"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { AlertCircle, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const router = useRouter()
  const { t } = useTranslation()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-9xl font-bold text-primary/20 dark:text-primary/30 select-none">404</div>
        </div>
      </div>
    )
  }

  return (
    <main className="ambient-section min-h-screen flex items-center justify-center py-20 bg-background">
        <div className="container relative z-10 mx-auto max-w-4xl px-4">
          <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
          
          <div className="relative z-20 text-center space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* 404 Number */}
            <div className="space-y-4">
              <h1 className="text-9xl font-bold text-primary/20 dark:text-primary/30 select-none">
                {t("notFound.title")}
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                {t("notFound.heading")}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("notFound.description")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <DemoButton
                onClick={() => router.back()}
                className="min-w-[200px]"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("notFound.goBack")}
              </DemoButton>
              
              <DemoButton asChild className="min-w-[200px]">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  {t("notFound.goHome")}
                </Link>
              </DemoButton>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-full blur-3xl" />
          </div>
        </div>
      </main>
  )
}
