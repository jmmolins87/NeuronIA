import "server-only"

/**
 * Production Guardrails
 * 
 * Prevents local development environment from affecting production database.
 * Implements fail-closed security: if something looks wrong, block the operation.
 */

import { env } from "@/lib/env"

export interface GuardrailCheck {
  name: string
  passed: boolean
  severity: "ERROR" | "WARNING"
  message: string
}

export interface GuardrailResult {
  safe: boolean
  checks: GuardrailCheck[]
  errors: string[]
  warnings: string[]
}

/**
 * Check if DATABASE_URL points to production database
 */
function isDatabaseUrlProduction(databaseUrl: string): boolean {
  const productionIndicators = [
    "neon.tech", // Neon production
    "prod.neon", // Neon production prefix
    "clinvetia-prod", // Custom production identifier
    "production", // Generic production identifier
  ]

  return productionIndicators.some(indicator => 
    databaseUrl.toLowerCase().includes(indicator)
  )
}

/**
 * Check if APP_URL points to production domain
 */
function isAppUrlProduction(appUrl: string): boolean {
  const productionDomains = [
    "clinvetia.com",
    "www.clinvetia.com",
    "vercel.app" // Vercel production deployments
  ]

  return productionDomains.some(domain => 
    appUrl.toLowerCase().includes(domain)
  )
}

/**
 * Run all guardrail checks
 */
export function runGuardrailChecks(): GuardrailResult {
  const checks: GuardrailCheck[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Check 1: Non-production environment should NOT use production APP_URL
  if (env.NODE_ENV !== "production") {
    const isAppProd = isAppUrlProduction(env.APP_URL)
    
    checks.push({
      name: "APP_URL_MISMATCH",
      passed: !isAppProd,
      severity: "ERROR",
      message: isAppProd
        ? `Local/dev environment (NODE_ENV=${env.NODE_ENV}) is using production APP_URL: ${env.APP_URL}`
        : "APP_URL does not point to production (OK for local/dev)"
    })

    if (isAppProd) {
      errors.push(
        "CRITICAL: Local environment is configured with production APP_URL. " +
        "This could lead to production data being affected. " +
        "Please use a local APP_URL (e.g., http://localhost:3000)"
      )
    }
  }

  // Check 2: Non-production environment should NOT use production DATABASE_URL
  if (env.NODE_ENV !== "production") {
    const isDbProd = isDatabaseUrlProduction(env.DATABASE_URL)
    
    checks.push({
      name: "DATABASE_URL_MISMATCH",
      passed: !isDbProd,
      severity: "ERROR",
      message: isDbProd
        ? `Local/dev environment (NODE_ENV=${env.NODE_ENV}) is using production DATABASE_URL`
        : "DATABASE_URL does not point to production (OK for local/dev)"
    })

    if (isDbProd) {
      errors.push(
        "CRITICAL: Local environment is configured with production DATABASE_URL. " +
        "This is EXTREMELY DANGEROUS and could corrupt production data. " +
        "Please use a local database (e.g., Docker Postgres)"
      )
    }
  }

  // Check 3: Production environment should use production URLs
  if (env.NODE_ENV === "production") {
    const isAppProd = isAppUrlProduction(env.APP_URL)
    const isDbProd = isDatabaseUrlProduction(env.DATABASE_URL)

    if (!isAppProd) {
      checks.push({
        name: "PROD_APP_URL_WARNING",
        passed: false,
        severity: "WARNING",
        message: "Production environment is using non-production APP_URL"
      })
      
      warnings.push(
        "WARNING: Production environment (NODE_ENV=production) is not using a production APP_URL. " +
        "This might be intentional (e.g., staging), but verify your configuration."
      )
    }

    if (!isDbProd) {
      checks.push({
        name: "PROD_DATABASE_URL_WARNING",
        passed: false,
        severity: "WARNING",
        message: "Production environment is using non-production DATABASE_URL"
      })
      
      warnings.push(
        "WARNING: Production environment (NODE_ENV=production) is not using a production DATABASE_URL. " +
        "This might be intentional (e.g., staging), but verify your configuration."
      )
    }
  }

  const safe = errors.length === 0

  return {
    safe,
    checks,
    errors,
    warnings
  }
}

/**
 * Validate environment on startup
 * 
 * Call this during app initialization to fail fast if configuration is unsafe.
 */
export function validateEnvironmentOnStartup(): void {
  const result = runGuardrailChecks()

  // Log warnings
  if (result.warnings.length > 0) {
    console.warn("\n⚠️  ENVIRONMENT WARNINGS:")
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
    console.warn("")
  }

  // Fail hard on errors
  if (!result.safe) {
    console.error("\n🚨 CRITICAL ENVIRONMENT ERRORS:")
    result.errors.forEach(error => console.error(`  ❌ ${error}`))
    console.error("\nEnvironment validation failed. Application startup blocked.")
    console.error("Fix the issues above before continuing.\n")
    
    throw new Error(
      "Environment validation failed: " +
      "Local/dev environment is configured to use production resources. " +
      "This is blocked to prevent data corruption."
    )
  }

  // Log success in non-production
  if (env.NODE_ENV !== "production") {
    console.log("✅ Environment guardrails: PASSED (safe to run locally)")
  }
}

/**
 * Middleware check for admin mutations
 * 
 * Validates that mutations are safe to execute in current environment.
 * Returns true if safe, false if blocked.
 */
export function validateAdminMutation(): { allowed: boolean; reason?: string } {
  // In production, always allow (assuming correct configuration)
  if (env.NODE_ENV === "production") {
    return { allowed: true }
  }

  // In non-production, check for production database
  const isDbProd = isDatabaseUrlProduction(env.DATABASE_URL)
  
  if (isDbProd) {
    return {
      allowed: false,
      reason: "Mutation blocked: Local environment detected with production database. " +
              "This is a safety measure to prevent accidental data corruption."
    }
  }

  return { allowed: true }
}

/**
 * Log guardrail check results
 */
export function logGuardrailResults(result: GuardrailResult): void {
  console.log("\n🛡️  Guardrail Checks:")
  result.checks.forEach(check => {
    const icon = check.passed ? "✅" : (check.severity === "ERROR" ? "❌" : "⚠️")
    console.log(`  ${icon} ${check.name}: ${check.message}`)
  })
  console.log("")
}

/**
 * Get environment safety status
 */
export function getEnvironmentSafetyStatus(): {
  environment: string
  safe: boolean
  canMutateRealData: boolean
  reason?: string
} {
  const result = runGuardrailChecks()
  const mutationCheck = validateAdminMutation()

  return {
    environment: env.NODE_ENV,
    safe: result.safe,
    canMutateRealData: mutationCheck.allowed,
    reason: mutationCheck.reason
  }
}
