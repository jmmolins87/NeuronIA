"use client"

import * as React from "react"
import { 
  Activity,
  Heart,
  Smile,
  Sparkles,
} from "lucide-react"

import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { FinalCtaSection } from "@/components/cta/final-cta-section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { GridPattern } from "@/components/shapes/grid-pattern"

const SCENARIOS = [
  {
    id: "aesthetic",
    icon: Sparkles,
    color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-pink-500 dark:via-purple-500 dark:to-purple-600",
    hoverBorder: "hover:border-pink-500",
    hoverShadow: "hover:shadow-pink-500/30 dark:hover:shadow-pink-500/20"
  },
  {
    id: "dental",
    icon: Smile,
    color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-green-500 dark:via-emerald-500 dark:to-pink-500",
    hoverBorder: "hover:border-blue-500",
    hoverShadow: "hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20"
  },
  {
    id: "physiotherapy",
    icon: Activity,
    color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-green-500 dark:via-emerald-600 dark:to-emerald-500",
    hoverBorder: "hover:border-green-500",
    hoverShadow: "hover:shadow-green-500/30 dark:hover:shadow-green-500/20"
  },
  {
    id: "veterinary",
    icon: Heart,
    color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-orange-500 dark:via-amber-600 dark:to-amber-500",
    hoverBorder: "hover:border-orange-500",
    hoverShadow: "hover:shadow-orange-500/30 dark:hover:shadow-orange-500/20"
  }
]

export default function EscenariosPage() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section variant="default" className="ambient-section py-12 md:py-16">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {t("scenarios.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("scenarios.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Mostrar solo Clínica Veterinaria */}
      {SCENARIOS.filter((s) => s.id === "veterinary").map((scenario, scenarioIndex) => (
        <ScenarioSection 
          key={scenario.id}
          scenario={scenario}
          index={scenarioIndex}
        />
      ))}

      <FinalCtaSection
        showMicroCta={true}
        titleKey="scenarios.cta.title"
        descriptionKey="scenarios.cta.description"
        primaryCtaKey="scenarios.cta.demo"
        secondaryCtaKey="scenarios.cta.roi"
      />
    </SiteShell>
  )
}

interface ScenarioSectionProps {
  scenario: typeof SCENARIOS[0]
  index: number
}

function ScenarioSection({ scenario, index }: ScenarioSectionProps) {
  const { t } = useTranslation()
  const Icon = scenario.icon
  
  const bgClass = "ambient-section"

  return (
    <Section variant="default" className={`py-12 md:py-16 ${bgClass}`}>
      {/* Decoraciones sutiles sin resplandor */}
      {index === 0 && <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8]]} />}
      {index === 1 && <GridPattern squares={[[4, 1], [9, 4], [14, 7], [6, 9]]} />}
      {index === 2 && <GridPattern squares={[[5, 3], [10, 7], [15, 2], [8, 10]]} />}
      {index === 3 && <GridPattern squares={[[2, 4], [8, 6], [13, 3], [17, 9]]} />}
      
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        {/* Scenario Header */}
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${scenario.color} flex items-center justify-center shadow-lg dark:glow-primary`}>
                <Icon className="w-8 h-8 text-white dark:text-black" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t(`scenarios.${scenario.id}.title`)}
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              {t(`scenarios.${scenario.id}.subtitle`)}
            </p>
          </div>
        </Reveal>

        {/* Bloque ampliado solo para Clínica Veterinaria */}
        {scenario.id === "veterinary" && (
          <Reveal delay={200}>
            <div className="max-w-6xl mx-auto">
              <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {t("scenarios.veterinary.cases.title")}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground">
                  {t("scenarios.veterinary.cases.description")}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {(["midnight", "postSurgery", "chronic", "vaccines"] as const).map((caseId) => (
                  <div
                    key={caseId}
                    className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 md:p-7 transition-all hover:border-primary/40 hover:shadow-xl dark:hover:shadow-primary/15"
                  >
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gradient-to dark:text-primary">
                          {t(`scenarios.veterinary.cases.items.${caseId}.badge`)}
                        </p>
                        <h4 className="text-xl md:text-2xl font-bold text-foreground">
                          {t(`scenarios.veterinary.cases.items.${caseId}.title`)}
                        </h4>
                      </div>

                      <p className="text-base text-foreground/80 dark:text-foreground/85 leading-relaxed">
                        {t(`scenarios.veterinary.cases.items.${caseId}.story`)}
                      </p>

                      <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                          {t("scenarios.veterinary.cases.ownerMessageLabel")}
                        </p>
                        <p className="text-base text-foreground leading-relaxed">
                          &quot;{t(`scenarios.veterinary.cases.items.${caseId}.ownerMessage`)}&quot;
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            {t("scenarios.veterinary.cases.systemDoesLabel")}
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {t(`scenarios.veterinary.cases.items.${caseId}.system`)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-background/30 p-4">
                          <p className="text-sm font-semibold text-muted-foreground mb-2">
                            {t("scenarios.veterinary.cases.outcomeLabel")}
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {t(`scenarios.veterinary.cases.items.${caseId}.outcome`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </Reveal>
        )}
      </div>
    </Section>
  )
}
