import "server-only"

import { ADMIN_SECURITY } from "./constants"

/**
 * In-memory rate limiter for admin login attempts
 * Production: replace with Redis or database-backed solution
 */

interface RateLimitEntry {
  attempts: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function getRateLimitKey(ip: string, username: string): string {
  return `${ip}:${username}`.toLowerCase()
}

export function checkRateLimit(ip: string, username: string): {
  allowed: boolean
  remainingAttempts: number
  resetAt: number
} {
  const key = getRateLimitKey(ip, username)
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)

  // Clean up expired entry
  if (entry && entry.resetAt <= now) {
    rateLimitStore.delete(key)
    entry = undefined
  }

  if (!entry) {
    entry = {
      attempts: 0,
      resetAt: now + ADMIN_SECURITY.RATE_LIMIT.WINDOW_MS,
    }
  }

  const allowed = entry.attempts < ADMIN_SECURITY.RATE_LIMIT.MAX_ATTEMPTS
  const remainingAttempts = Math.max(
    0,
    ADMIN_SECURITY.RATE_LIMIT.MAX_ATTEMPTS - entry.attempts
  )

  return {
    allowed,
    remainingAttempts,
    resetAt: entry.resetAt,
  }
}

export function recordLoginAttempt(ip: string, username: string): void {
  const key = getRateLimitKey(ip, username)
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt <= now) {
    entry = {
      attempts: 1,
      resetAt: now + ADMIN_SECURITY.RATE_LIMIT.WINDOW_MS,
    }
  } else {
    entry.attempts += 1
  }

  rateLimitStore.set(key, entry)
}

export function resetRateLimit(ip: string, username: string): void {
  const key = getRateLimitKey(ip, username)
  rateLimitStore.delete(key)
}
