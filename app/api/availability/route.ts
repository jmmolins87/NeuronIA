import { okJson } from "@/lib/api/respond"
import { getAvailability } from "@/lib/booking/availability"
import { getNowFromRequest } from "@/lib/booking/time"
import { ApiError, toResponse } from "@/lib/errors"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    if (!date) {
      throw new ApiError("INVALID_INPUT", "Invalid input", {
        status: 400,
        fields: { date: "Required" },
      })
    }

    const now = getNowFromRequest(request)
    const result = await getAvailability(prisma, date, now)
    return okJson(result)
  } catch (error: unknown) {
    return toResponse(error)
  }
}
