import { Badge } from "@/components/ui/badge"
import type { BookingStatus } from "@/app/admin/_mock/bookings"
import { statusLabel } from "@/app/admin/_lib/format"

export function StatusBadge({ status }: { status: BookingStatus }) {
  const variant =
    status === "CONFIRMED"
      ? "success"
      : status === "CANCELLED"
        ? "destructive"
        : status === "RESCHEDULED"
          ? "warning"
          : status === "EXPIRED"
            ? "outline"
            : "secondary"

  return <Badge variant={variant}>{statusLabel(status)}</Badge>
}
