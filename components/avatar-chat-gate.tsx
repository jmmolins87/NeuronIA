"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { AvatarChat } from "@/components/AvatarChat"

const ALLOWED_TOP_LEVEL_ROUTES = new Set([
  "", // /
  "contacto",
  "reservar",
  "roi",
  "faqs",
  "como-funciona",
  "escenarios",
  "metodologia",
  "solucion",
  "cancel",
  "cancelado",
  "reagendar",
  "reschedule",
])

export function AvatarChatGate() {
  const pathname = usePathname()

  const firstSegment = React.useMemo(() => {
    const path = (pathname ?? "/").split("?")[0]
    return path.split("/")[1] ?? ""
  }, [pathname])

  if (!ALLOWED_TOP_LEVEL_ROUTES.has(firstSegment)) return null

  return <AvatarChat />
}
