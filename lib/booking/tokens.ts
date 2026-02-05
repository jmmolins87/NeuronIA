import "server-only"

import crypto from "crypto"

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url")
}

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60_000)
}
