import "server-only"

/**
 * Admin Mode Enforcement
 * 
 * Ensures SUPER_ADMIN users are always in REAL mode.
 * Prevents elevation to SUPER_ADMIN for DEMO mode users.
 */

import type { AdminUser, AdminRole, AdminMode } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface EnforcementResult {
  corrected: boolean
  previousMode?: AdminMode
  message?: string
}

/**
 * Enforce SUPER_ADMIN → REAL mode
 * 
 * If a SUPER_ADMIN user is found in DEMO mode (should never happen),
 * automatically correct it to REAL and log the incident.
 */
export async function enforceSuperAdminMode(
  user: Pick<AdminUser, "id" | "username" | "role" | "mode">
): Promise<EnforcementResult> {
  // Only enforce for SUPER_ADMIN
  if (user.role !== "SUPER_ADMIN") {
    return { corrected: false }
  }

  // Check if mode is incorrect
  if (user.mode === "DEMO") {
    console.error(`[ENFORCEMENT] CRITICAL: SUPER_ADMIN user "${user.username}" (${user.id}) was in DEMO mode. Auto-correcting to REAL.`)
    
    try {
      // Correct the mode in database
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { mode: "REAL" }
      })

      // Log the enforcement action
      await prisma.userAdminAudit.create({
        data: {
          adminId: user.id,
          targetAdminId: user.id,
          action: "MODE_AUTO_CORRECTED",
          metadata: {
            reason: "SUPER_ADMIN cannot be in DEMO mode",
            previousMode: "DEMO",
            newMode: "REAL",
            timestamp: new Date().toISOString()
          }
        }
      })

      return {
        corrected: true,
        previousMode: "DEMO",
        message: "SUPER_ADMIN mode auto-corrected from DEMO to REAL"
      }
    } catch (error) {
      console.error("[ENFORCEMENT] Failed to correct SUPER_ADMIN mode:", error)
      throw new Error("Failed to enforce SUPER_ADMIN mode constraints")
    }
  }

  return { corrected: false }
}

/**
 * Validate mode change request
 * 
 * Prevents:
 * - Changing SUPER_ADMIN to DEMO mode
 * - Elevating DEMO user to SUPER_ADMIN
 */
export function validateModeChange(
  currentRole: AdminRole,
  currentMode: AdminMode,
  newRole?: AdminRole,
  newMode?: AdminMode
): { valid: boolean; error?: string } {
  const targetRole = newRole ?? currentRole
  const targetMode = newMode ?? currentMode

  // Rule 1: SUPER_ADMIN cannot be in DEMO mode
  if (targetRole === "SUPER_ADMIN" && targetMode === "DEMO") {
    return {
      valid: false,
      error: "SUPER_ADMIN users must be in REAL mode"
    }
  }

  // Rule 2: Cannot elevate DEMO user to SUPER_ADMIN without changing mode first
  if (currentMode === "DEMO" && newRole === "SUPER_ADMIN" && newMode !== "REAL") {
    return {
      valid: false,
      error: "Cannot elevate DEMO user to SUPER_ADMIN. Change mode to REAL first."
    }
  }

  return { valid: true }
}

/**
 * Get enforced user data
 * 
 * Returns user data with mode enforcement applied.
 * Use this when returning user data to ensure consistency.
 */
export function getEnforcedUserData(user: Pick<AdminUser, "id" | "username" | "email" | "role" | "mode" | "isActive">) {
  // Force REAL mode for SUPER_ADMIN
  const enforcedMode = user.role === "SUPER_ADMIN" ? "REAL" : user.mode

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    mode: enforcedMode,
    isActive: user.isActive
  }
}

/**
 * Check if user should have access to DEMO features
 */
export function canAccessDemoFeatures(user: Pick<AdminUser, "role" | "mode">): boolean {
  // SUPER_ADMIN never accesses DEMO features
  if (user.role === "SUPER_ADMIN") {
    return false
  }

  // Only DEMO mode users can access DEMO features
  return user.mode === "DEMO"
}

/**
 * Check if user should have access to REAL data
 */
export function canAccessRealData(user: Pick<AdminUser, "role" | "mode">): boolean {
  // SUPER_ADMIN always accesses REAL data
  if (user.role === "SUPER_ADMIN") {
    return true
  }

  // Only REAL mode users can access REAL data
  return user.mode === "REAL"
}

/**
 * Validate and enforce mode constraints on user update
 */
export async function enforceUserUpdate(
  userId: string,
  updates: { role?: AdminRole; mode?: AdminMode }
): Promise<{ success: boolean; error?: string }> {
  // Get current user data
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { role: true, mode: true }
  })

  if (!user) {
    return { success: false, error: "User not found" }
  }

  // Validate the mode change
  const validation = validateModeChange(user.role, user.mode, updates.role, updates.mode)
  
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  return { success: true }
}
