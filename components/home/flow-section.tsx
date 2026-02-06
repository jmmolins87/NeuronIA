"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Section } from "@/components/section"
import { useTranslation } from "@/components/providers/i18n-provider"
import { BlobShape } from "@/components/shapes/blob-shape"
import { WaveLines } from "@/components/animations/wave-lines"
import { FrictionlessFlow } from "@/components/frictionless-flow"
import { Reveal } from "@/components/reveal"

const P5NoiseBlob = dynamic(
  () => import("@/components/canvas/p5-noise-blob").then((mod) => mod.P5NoiseBlob),
  { ssr: false }
)

export function FlowSection() {
  const { t } = useTranslation()

  return (
    <Section variant="muted" id="flow-section" className="ambient-section min-h-screen md:h-screen flex flex-col justify-center py-16 pb-12 md:pb-0">
      <WaveLines count={12} />
      <P5NoiseBlob />
      <BlobShape position="bottom-right" color="accent" className="w-96 h-96" parallax parallaxSpeed={0.4} />
      <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
        <Reveal delay={100}>
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 lg:mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {t("home.flow.title")}
            </h2>
            <p className="text-xl text-foreground/80 dark:text-foreground/90 sm:text-2xl">
              {t("home.flow.description")}
            </p>
          </div>
        </Reveal>

        <FrictionlessFlow />
      </div>
    </Section>
  )
}
