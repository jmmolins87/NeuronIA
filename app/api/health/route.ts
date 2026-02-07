import "server-only"

import { okJson } from "@/lib/api/respond"
import { bookingConfig } from "@/lib/booking/config"
import { NextResponse } from "next/server";
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let db = false
  try {
    await prisma.$queryRaw`SELECT 1`
    db = true
  } catch {
    db = false
  }

  const url = new URL(req.url);
  // Redirige internamente (307) al health real
  url.pathname = "/api/health/db";
  return NextResponse.redirect(url, 307);

  return okJson({
    env: env.NODE_ENV,
    db,
    emailEnabled: Boolean(env.EMAIL_ENABLED),
    timezone: bookingConfig.timeZone,
    bookingHours: {
      start: bookingConfig.startTime,
      end: bookingConfig.endTime,
      slotMinutes: bookingConfig.slotMinutes,
    },
    allowTimeOverride: Boolean(bookingConfig.allowTimeOverride),
  })
}
