import type { NextResponse } from "next/server"

import { errorJson } from "@/lib/api/respond"

export type ErrorFields = Record<string, string>

export class ApiError extends Error {
  public readonly code: string
  public readonly status: number
  public readonly fields?: ErrorFields

  constructor(code: string, message: string, opts?: { status?: number; fields?: ErrorFields }) {
    super(message)
    this.code = code
    this.status = opts?.status ?? 400
    this.fields = opts?.fields
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function toResponse(error: unknown): NextResponse {
  if (isApiError(error)) {
    return errorJson(error.code, error.message, { status: error.status, fields: error.fields })
  }

  const message = error instanceof Error ? error.message : "Unknown error"
  return errorJson("INTERNAL_ERROR", message, { status: 500 })
}
