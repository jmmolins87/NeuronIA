"use client"

import * as React from "react"
import { BookingCalendar } from "@/components/booking-calendar"
import type { BookingCompleteData } from "@/components/booking-calendar"
import { useTranslation } from "@/components/providers/i18n-provider"
import { Modal } from "@/components/modal"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookingComplete?: (data: BookingCompleteData) => void
}

export function BookingModal({ open, onOpenChange, onBookingComplete }: BookingModalProps) {
  const { t } = useTranslation()

  const handleBookingComplete = (data: BookingCompleteData) => {
    onBookingComplete?.(data)
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t("booking.title")}
      description={t("booking.description")}
      closeAriaLabel={t("common.close")}
      contentClassName="sm:max-w-3xl"
      bodyClassName="pr-0"
    >
      <div className="pr-4">
        <BookingCalendar onBookingComplete={handleBookingComplete} />
      </div>
    </Modal>
  )
}
