import { NextResponse } from "next/server"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, db: "connected" })
  } catch (error: unknown) {
    const message =
      env.NODE_ENV === "production"
        ? "Database unavailable"
        : error instanceof Error
          ? error.message
          : "Unknown error"

    return NextResponse.json(
      { ok: false, code: "DB_UNAVAILABLE", message },
      { status: 500 }
    )
  }
}
