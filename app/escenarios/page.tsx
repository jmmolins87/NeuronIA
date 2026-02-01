"use client"

import * as React from "react"
import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { Reveal } from "@/components/reveal"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"
import { 
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle,
  Sparkles,
  Smile,
  Activity
} from "lucide-react"

const SCENARIOS = [
  {
    id: "aesthetic",
    icon: Sparkles,
    color: "from-pink-500 to-purple-500"
  },
  {
    id: "dental",
    icon: Smile,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "physiotherapy",
    icon: Activity,
    color: "from-green-500 to-emerald-500"
  }
]

const SCENARIO_SECTIONS = [
  { id: "situation", icon: Calendar },
  { id: "problem", icon: MessageCircle },
  { id: "action", icon: Clock },
  { id: "change", icon: CheckCircle }
]

export default function EscenariosPage() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      {/* Hero Section */}
      <Section variant="default" className="py-12 md:py-16 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20">
        <GridPattern squares={[[2, 1], [6, 3], [11, 6], [16, 2]]} />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text-pulse">
                {t("scenarios.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("scenarios.description")}
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Scenarios */}
      {SCENARIOS.map((scenario, scenarioIndex) => (
        <ScenarioSection 
          key={scenario.id}
          scenario={scenario}
          index={scenarioIndex}
        />
      ))}
    </SiteShell>
  )
}

interface ScenarioSectionProps {
  scenario: typeof SCENARIOS[0]
  index: number
}

function ScenarioSection({ scenario, index }: ScenarioSectionProps) {
  const { t } = useTranslation()
  const { ref: cardsRef } = useStagger({ stagger: 120, duration: 650, distance: 40 })
  const Icon = scenario.icon

  const variant = index % 2 === 0 ? "default" : "muted"
  
  // Fondos con tintes sutilmente diferentes
  const bgClass = index % 3 === 0 
    ? "bg-gradient-to-b from-pink-50/30 via-background to-purple-50/20 dark:from-pink-950/10 dark:via-background dark:to-purple-950/10"
    : index % 3 === 1
    ? "bg-gradient-to-b from-blue-50/30 via-background to-cyan-50/20 dark:from-blue-950/10 dark:via-background dark:to-cyan-950/10"
    : "bg-gradient-to-b from-green-50/30 via-background to-emerald-50/20 dark:from-green-950/10 dark:via-background dark:to-emerald-950/10"

  return (
    <Section variant={variant} className={`py-12 md:py-16 ${bgClass}`}>
      {/* Decoraciones sutiles sin resplandor */}
      {index === 0 && <GridPattern squares={[[3, 2], [7, 5], [12, 3], [18, 8]]} />}
      {index === 1 && <GridPattern squares={[[4, 1], [9, 4], [14, 7], [6, 9]]} />}
      {index === 2 && <GridPattern squares={[[5, 3], [10, 7], [15, 2], [8, 10]]} />}
      
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        {/* Scenario Header */}
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${scenario.color} flex items-center justify-center shadow-lg dark:glow-primary`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text-slide">
              {t(`scenarios.${scenario.id}.title`)}
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              {t(`scenarios.${scenario.id}.subtitle`)}
            </p>
          </div>
        </Reveal>

        {/* Scenario Cards */}
        <div ref={cardsRef as React.RefObject<HTMLDivElement>} className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {SCENARIO_SECTIONS.map((section) => {
            const SectionIcon = section.icon
            return (
              <div 
                key={section.id}
                data-stagger-item
                className="group relative rounded-xl border-2 border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:scale-105 hover:shadow-xl dark:hover:glow-md"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${scenario.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <SectionIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground pt-2">
                    {t(`scenarios.${scenario.id}.${section.id}.title`)}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`scenarios.${scenario.id}.${section.id}.description`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
