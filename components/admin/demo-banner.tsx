"use client"

/**
 * Demo Mode Banner
 * 
 * Displays a persistent banner at the top of admin dashboard
 * when user is in DEMO mode. Not shown for SUPER_ADMIN or REAL mode users.
 */

import { AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export interface DemoBannerProps {
  className?: string
}

export function DemoBanner({ className }: DemoBannerProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-50 flex items-center gap-3 border-b bg-yellow-50 px-4 py-3 text-sm text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <strong className="font-semibold">Modo DEMO</strong>
        <span className="ml-2">
          Los datos mostrados son ficticios y no afectan la base de datos real. 
          Perfecto para demostrar el sistema a clientes.
        </span>
      </div>
    </div>
  )
}
