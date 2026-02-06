"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"
import { useStagger } from "@/hooks/use-stagger"

export function WhatWeDontDo() {
  const { t } = useTranslation()
  const { ref: gridRef } = useStagger({ stagger: 100, duration: 600, distance: 30 })
  
  const notData = t("methodology.not.items")
  const items = (typeof notData === "string" ? [] : notData) as Array<{ title: string; text: string }>

  return (
    <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
      {items.map((item) => (
        <div
          key={item.title}
          data-stagger-item
          className="relative overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur-sm p-6 transition-all hover:border-muted-foreground hover:shadow-lg"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gradient-from/0 via-gradient-to/40 to-gradient-to/0"
          />
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
