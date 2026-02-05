import "server-only"

import type { FieldErrors } from "@/lib/api/respond"

export class ApiError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly fields?: FieldErrors

  constructor(code: string, message: string, opts?: { status?: number; fields?: FieldErrors }) {
    super(message)
    this.code = code
    this.status = opts?.status ?? 400
    this.fields = opts?.fields
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
