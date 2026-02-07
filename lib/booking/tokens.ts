import "server-only"

import { createHash, randomBytes } from "crypto"

export function generateToken(): string {
  // 256-bit random token, URL-safe.
  return randomBytes(32).toString("base64url")
}

export function generateSessionToken(): string {
  return generateToken()
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

export function generateBookingUid(): string {
  // Stable-ish per booking, unique, and safe for ICS UID.
  return `clinvetia-${randomBytes(16).toString("hex")}`
}
