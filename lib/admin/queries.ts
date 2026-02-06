import "server-only"

import type { Prisma } from "@prisma/client"
import { z } from "zod"

import { env } from "@/lib/env"
import {
  nextDayStartUtc,
  parseDateYYYYMMDD,
  startOfDayUtc,
} from "@/lib/booking/time"

const PageSchema = z.coerce.number().int().min(1).default(1)
const PageSizeSchema = z.coerce.number().int().refine((v) => v === 10 || v === 20 || v === 50, {
  message: "Expected 10, 20, or 50",
}).default(20)

const StatusSchema = z
  .enum(["HELD", "CONFIRMED", "CANCELLED", "RESCHEDULED", "EXPIRED"])
  .optional()

const QuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  status: StatusSchema,
  q: z.string().trim().min(1).max(200).optional(),
  page: PageSchema,
  pageSize: PageSizeSchema,
})

export type AdminBookingsQuery = z.infer<typeof QuerySchema>

export function parseAdminBookingsQuery(searchParams: URLSearchParams): {
  ok: true
  data: AdminBookingsQuery
} | {
  ok: false
  fields: Record<string, string>
} {
  const raw = {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  }

  const parsed = QuerySchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "(root)"
      if (!fields[key]) fields[key] = issue.message
    }
    return { ok: false, fields }
  }

  const out = parsed.data
  const fields: Record<string, string> = {}

  if (out.from && !parseDateYYYYMMDD(out.from)) fields.from = "Expected YYYY-MM-DD"
  if (out.to && !parseDateYYYYMMDD(out.to)) fields.to = "Expected YYYY-MM-DD"
  if (out.from && out.to && out.from > out.to) fields.to = "Must be >= from"

  if (Object.keys(fields).length > 0) return { ok: false, fields }
  return { ok: true, data: out }
}

export function buildBookingsWhere(args: {
  from?: string
  to?: string
  status?: "HELD" | "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "EXPIRED"
  q?: string
}): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {}

  if (args.from || args.to) {
    const from = args.from ? startOfDayUtc(args.from, env.BOOKING_TIMEZONE) : undefined
    const to = args.to ? nextDayStartUtc(args.to, env.BOOKING_TIMEZONE) : undefined
    where.startAt = {
      ...(from ? { gte: from } : null),
      ...(to ? { lt: to } : null),
    }
  }

  if (args.status) {
    if (args.status === "RESCHEDULED") {
      where.rescheduledAt = { not: null }
      where.status = "CONFIRMED"
    } else {
      where.status = args.status
    }
  }

  if (args.q) {
    where.OR = [
      { customerEmail: { contains: args.q, mode: "insensitive" } },
      { customerName: { contains: args.q, mode: "insensitive" } },
    ]
  }

  return where
}

export function getPagination(page: number, pageSize: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
