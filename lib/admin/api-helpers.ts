import "server-only"

/**
 * Admin API Helpers
 * 
 * Helpers for validating admin permissions in API routes.
 */

import type { AdminMode, AdminRole } from "@prisma/client"
import { NextResponse } from "next/server"

import { errorJson } from "@/lib/api/respond"
import { validateAdminMutation } from "./guardrails"

export interface AdminPermissionCheck {
  allowed: boolean
  response?: NextResponse
}

/**
 * Check if user can perform mutations on REAL data
 * 
 * Returns { allowed: true } if user is in REAL mode and environment is safe.
 * Returns { allowed: false, response: NextResponse } with error response if blocked.
 */
export function canMutateRealData(userMode: AdminMode): AdminPermissionCheck {
  // Check if user is in DEMO mode
  if (userMode === "DEMO") {
    return {
      allowed: false,
      response: errorJson(
        "DEMO_MODE",
        "Cannot perform this action in DEMO mode. Switch to REAL mode to modify actual data.",
        { status: 403 }
      ),
    }
  }

  // Check environment guardrails
  const mutationCheck = validateAdminMutation()
  
  if (!mutationCheck.allowed) {
    return {
      allowed: false,
      response: errorJson(
        "ENVIRONMENT_BLOCK",
        mutationCheck.reason || "Mutation blocked by environment safety checks",
        { status: 403 }
      ),
    }
  }

  return { allowed: true }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: AdminRole, requiredRole: AdminRole): AdminPermissionCheck {
  // SUPER_ADMIN can do anything
  if (userRole === "SUPER_ADMIN") {
    return { allowed: true }
  }

  // Check exact role match
  if (userRole === requiredRole) {
    return { allowed: true }
  }

  return {
    allowed: false,
    response: errorJson(
      "INSUFFICIENT_PERMISSIONS",
      `This action requires ${requiredRole} role`,
      { status: 403 }
    ),
  }
}

/**
 * Combined check: user must be in REAL mode AND have required role
 */
export function canPerformAdminMutation(
  userMode: AdminMode,
  userRole: AdminRole,
  requiredRole?: AdminRole
): AdminPermissionCheck {
  // First check mode
  const modeCheck = canMutateRealData(userMode)
  if (!modeCheck.allowed) {
    return modeCheck
  }

  // Then check role if required
  if (requiredRole) {
    const roleCheck = hasRole(userRole, requiredRole)
    if (!roleCheck.allowed) {
      return roleCheck
    }
  }

  return { allowed: true }
}
