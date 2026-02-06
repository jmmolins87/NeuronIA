import "server-only"

import { createHash, randomBytes } from "crypto"

export function generateSessionToken(): string {
  // 256-bit random token, URL-safe.
  return randomBytes(32).toString("base64url")
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}
