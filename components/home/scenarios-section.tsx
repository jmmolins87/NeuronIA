"use client"

import * as React from "react"
import Link from "next/link"
import { Section } from "@/components/section"
import { DemoButton } from "@/components/cta/demo-button"
import { useTranslation } from "@/components/providers/i18n-provider"
import { AlertCircle, Syringe, Activity, Scissors } from "lucide-react"

export function ScenariosSection() {
  const { t } = useTranslation()

  return (
    <Section variant="card" id="scenarios-section" className="home-reflections min-h-screen md:h-screen flex flex-col justify-center py-16 md:py-20 pb-12 md:pb-20">
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("home.scenarios.title")}
          </h2>
          <p className="text-lg text-foreground/80 dark:text-foreground/90 sm:text-xl">
            {t("home.scenarios.description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-10">
          {[
            { type: "emergency", icon: AlertCircle, color: "from-red-500 via-orange-600 to-red-600 dark:from-red-500 dark:via-orange-500 dark:to-red-500" },
            { type: "preventive", icon: Syringe, color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-green-500 dark:via-pink-500 dark:to-fuchsia-500" },
            { type: "chronic", icon: Activity, color: "from-purple-500 via-pink-600 to-purple-600 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500" },
            { type: "multiservice", icon: Scissors, color: "from-green-500 via-emerald-600 to-green-600 dark:from-green-500 dark:via-emerald-500 dark:to-green-500" }
          ].map(({ type, icon: Icon, color }) => (
            <div 
              key={type} 
              className="group rounded-lg border border-border bg-background/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20"
            >
              <div className="flex justify-center mb-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg dark:glow-sm`}>
                  <Icon className="w-7 h-7 text-white dark:text-black" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gradient-to dark:text-primary group-hover:text-primary transition-colors">
                {t(`home.scenarios.types.${type}.title`)}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t(`home.scenarios.types.${type}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <DemoButton asChild size="lg">
            <Link href="/escenarios">{t("home.scenarios.cta")}</Link>
          </DemoButton>
        </div>
      </div>
    </Section>
  )
}
