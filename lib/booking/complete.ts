import "server-only"

import { Prisma } from "@prisma/client"

import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api/errors"
import { expireHolds } from "@/lib/booking/holds"
import { createBookingEvent } from "@/lib/booking/events"
import { addDays, generateToken, sha256Hex } from "@/lib/booking/tokens"

export type BookingLocale = "es" | "en"

export interface BookingContact {
  name?: string
  email: string
  phone?: string
}

export async function confirmBookingAndGenerateTokens(args: {
  sessionToken: string
  now: Date
  locale: BookingLocale
  contact: BookingContact
  formData: unknown
  roiData: unknown
}): Promise<{
  bookingId: string
  bookingStartAt: Date
  bookingEndAt: Date
  bookingTimezone: string
  bookingLocale: BookingLocale
  customerEmail: string
  cancelToken: string
  rescheduleToken: string
  idempotent: boolean
}> {
  const tokenHash = sha256Hex(args.sessionToken)

  return prisma.$transaction(async (tx) => {
    await expireHolds(tx, args.now)

    const session = await tx.bookingToken.findFirst({
      where: {
        kind: "SESSION",
        tokenHash,
      },
      include: {
        booking: true,
      },
    })

    if (!session) {
      throw new ApiError("TOKEN_INVALID", "Invalid session token.", { status: 400 })
    }

    if (session.expiresAt <= args.now) {
      throw new ApiError("TOKEN_EXPIRED", "Session token expired.", { status: 410 })
    }

    const b = session.booking

    if (session.usedAt) {
      if (b.status === "CONFIRMED") {
        return {
          bookingId: b.id,
          bookingStartAt: b.startAt,
          bookingEndAt: b.endAt,
          bookingTimezone: b.timezone,
          bookingLocale: (b.locale === "en" ? "en" : "es") satisfies BookingLocale,
          customerEmail: b.customerEmail ?? args.contact.email,
          cancelToken: "",
          rescheduleToken: "",
          idempotent: true,
        }
      }
      throw new ApiError("TOKEN_INVALID", "Session token already used.", { status: 410 })
    }

    if (b.status !== "HELD") {
      throw new ApiError("TOKEN_INVALID", "Booking is not in HELD status.", { status: 409 })
    }

    if (b.expiresAt && b.expiresAt <= args.now) {
      throw new ApiError("TOKEN_EXPIRED", "Booking hold expired.", { status: 410 })
    }

    const customerEmail = args.contact.email.trim().toLowerCase()
    if (!customerEmail) {
      throw new ApiError("INVALID_INPUT", "Missing customer email.", {
        status: 400,
        fields: { "contact.email": "Required" },
      })
    }

    const cancelToken = generateToken()
    const rescheduleToken = generateToken()

    const cancelTokenHash = sha256Hex(cancelToken)
    const rescheduleTokenHash = sha256Hex(rescheduleToken)

    const cancelExpiresAt = addDays(args.now, env.CANCEL_TOKEN_EXPIRY_DAYS)
    const rescheduleExpiresAt = addDays(args.now, env.RESCHEDULE_TOKEN_EXPIRY_DAYS)

    await tx.booking.update({
      where: { id: b.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: args.now,
        expiresAt: null,
        locale: args.locale,
        customerEmail,
        customerName: args.contact.name?.trim() || null,
        formData: {
          contact: {
            name: args.contact.name,
            email: customerEmail,
            phone: args.contact.phone,
          },
          formData: args.formData,
        } as Prisma.InputJsonValue,
        roiData: args.roiData as Prisma.InputJsonValue,
      },
      select: { id: true },
    })

    await tx.bookingToken.update({
      where: { id: session.id },
      data: { usedAt: args.now },
      select: { id: true },
    })

    await tx.bookingToken.createMany({
      data: [
        {
          bookingId: b.id,
          kind: "CANCEL",
          tokenHash: cancelTokenHash,
          expiresAt: cancelExpiresAt,
        },
        {
          bookingId: b.id,
          kind: "RESCHEDULE",
          tokenHash: rescheduleTokenHash,
          expiresAt: rescheduleExpiresAt,
        },
      ],
    })

    await tx.bookingEvent.createMany({
      data: [
        {
          bookingId: b.id,
          type: "CONFIRMED",
          metadata: {
            locale: args.locale,
          },
        },
        {
          bookingId: b.id,
          type: "TOKENS_CREATED",
          metadata: {
            cancelExpiresAt: cancelExpiresAt.toISOString(),
            rescheduleExpiresAt: rescheduleExpiresAt.toISOString(),
          },
        },
      ],
    })

    // Keep a single source-of-truth event record that email layer can add to.
    await createBookingEvent(tx, b.id, "CONTACT_SAVED", {
      customerEmail,
      hasRoiData: true,
    })

    return {
      bookingId: b.id,
      bookingStartAt: b.startAt,
      bookingEndAt: b.endAt,
      bookingTimezone: b.timezone,
      bookingLocale: args.locale,
      customerEmail,
      cancelToken,
      rescheduleToken,
      idempotent: false,
    }
  })
}
