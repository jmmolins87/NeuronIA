"use client"

import { SiteShell } from "@/components/site-shell"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Reveal } from "@/components/reveal"
import { FinalCTA } from "@/components/final-cta"
import { BlobShape } from "@/components/shapes/blob-shape"
import { GridPattern } from "@/components/shapes/grid-pattern"

export default function MetodologiaPage() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      <Section variant="default" className="py-16 md:py-20 bg-gradient-to-b from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20">
        <GridPattern squares={[[3, 2], [10, 5]]} />
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4">
          <div className="max-w-4xl space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl gradient-text-pulse">
              {t("methodology.title")}
            </h1>
            <p className="text-lg text-foreground/80 dark:text-foreground/90">
              {t("methodology.description")}
            </p>
          </div>
        </div>
      </Section>

      {/* Final CTA Section */}
      <Section
        variant="default"
        className="py-20 md:py-24 bg-gradient-to-br from-white via-background to-card/30 dark:from-black dark:via-background dark:to-card/20"
      >
        <BlobShape
          position="center"
          color="primary"
          className="w-[500px] h-[500px] opacity-20"
          parallax
          parallaxSpeed={0.1}
        />
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
          <Reveal delay={100}>
            <FinalCTA showMicroCta={true} />
          </Reveal>
        </div>
      </Section>
    </SiteShell>
  )
}
