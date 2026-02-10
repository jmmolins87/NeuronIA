"use client"

/**
 * Floating Admin Badge
 * 
 * Shows a floating badge in the bottom-right corner for:
 * - SUPER_ADMIN role
 * - DEMO mode
 */

import type { AdminRole, AdminMode } from "@prisma/client"
import { Shield } from "lucide-react"

import { cn } from "@/lib/utils"

export interface FloatingBadgeProps {
  role: AdminRole
  mode: AdminMode
}

export function FloatingBadge({ role, mode }: FloatingBadgeProps) {
  // Don't show anything for regular admins in REAL mode
  if (role !== "SUPER_ADMIN" && mode !== "DEMO") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {role === "SUPER_ADMIN" && (
        <div className="flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 shadow-lg ring-1 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-900">
          <Shield className="size-4" />
          <span>SUPER ADMIN</span>
        </div>
      )}
      
      {mode === "DEMO" && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800 shadow-lg ring-1 ring-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:ring-yellow-900">
          <span>DEMO MODE</span>
        </div>
      )}
    </div>
  )
}
