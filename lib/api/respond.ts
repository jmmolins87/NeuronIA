import { NextResponse } from "next/server"

export type FieldErrors = Record<string, string>

export function okJson<T extends Record<string, unknown>>(
  body: T,
  init?: ResponseInit
): NextResponse {
  return NextResponse.json({ ok: true, ...body }, init)
}

export function errorJson(
  code: string,
  message: string,
  opts?: { status?: number; fields?: FieldErrors }
): NextResponse {
  const status = opts?.status ?? 400
  const payload: Record<string, unknown> = { ok: false, code, message }
  if (opts?.fields && Object.keys(opts.fields).length > 0) {
    payload.fields = opts.fields
  }
  return NextResponse.json(payload, { status })
}
