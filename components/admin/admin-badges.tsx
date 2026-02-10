"use client"

/**
 * Admin Badges
 * 
 * Displays role and mode badges for admin users.
 * - SUPER_ADMIN: always shows "SUPER ADMIN" badge
 * - DEMO mode: shows "DEMO" badge (warning color)
 * - REAL mode: no badge (default)
 */

import type { AdminRole, AdminMode } from "@prisma/client"

import { cn } from "@/lib/utils"

export interface AdminBadgesProps {
  role: AdminRole
  mode: AdminMode
  className?: string
}

export function AdminBadges({ role, mode, className }: AdminBadgesProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {role === "SUPER_ADMIN" && (
        <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          SUPER ADMIN
        </span>
      )}
      
      {mode === "DEMO" && (
        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          DEMO
        </span>
      )}
    </div>
  )
}
