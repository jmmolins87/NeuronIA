import * as React from "react"
import Link from "next/link"
import { CircleAlert, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NeonButton } from "@/components/ui/neon-button"
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from "@/components/ui/neon-card"
import { cn } from "@/lib/utils"

export interface TokenErrorStateProps {
  title: string
  description: string
  locale: "es" | "en"
  code?: string
  className?: string
  primaryHref?: string
  secondaryHref?: string
}

export function TokenErrorState({
  title,
  description,
  locale,
  code,
  className,
  primaryHref = "/contacto",
  secondaryHref = "/",
}: TokenErrorStateProps) {
  return (
    <NeonCard className={cn("bg-card/70 backdrop-blur-sm", className)}>
      <NeonCardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/50">
            <CircleAlert className="size-5 text-destructive" />
          </div>
          <div className="min-w-0">
            <NeonCardTitle className="text-xl">{title}</NeonCardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            {code ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">{code}</p>
            ) : null}
          </div>
        </div>
      </NeonCardHeader>
      <NeonCardContent>
        <div className="flex flex-col gap-3 sm:flex-row">
          <NeonButton asChild className="w-full sm:w-auto">
            <Link href={primaryHref}>
              <Mail className="size-4" />
              {locale === "en" ? "Contact support" : "Contactar"}
            </Link>
          </NeonButton>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={secondaryHref}>{locale === "en" ? "Back to website" : "Volver a la web"}</Link>
          </Button>
        </div>
      </NeonCardContent>
    </NeonCard>
  )
}
