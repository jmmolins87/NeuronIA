"use client"

import * as React from "react"
import { ArrowRight, CalendarCheck, MessageCircle, Repeat2, Target } from "lucide-react"

import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/ui/neon-card"

const WHAT_ICONS = [Target, MessageCircle, CalendarCheck, Repeat2]

export function WhatWeDo() {
  const { t } = useTranslation()
  const { ref: gridRef } = useStagger({ stagger: 90, duration: 600, distance: 24 })

  const itemsData = t("methodology.what.items")
  const items = (typeof itemsData === "string" ? [] : itemsData) as Array<{ title: string; text: string }>

  return (
    <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = WHAT_ICONS[index] ?? ArrowRight
        return (
          <NeonCard key={item.title} data-stagger-item className="bg-card/70 backdrop-blur-sm">
            <NeonCardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <NeonCardTitle className="text-xl">{item.title}</NeonCardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/40">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </NeonCardHeader>
            <NeonCardContent className="pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </NeonCardContent>
          </NeonCard>
        )
      })}
    </div>
  )
}
