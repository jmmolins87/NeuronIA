"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, MoreHorizontal, XCircle, CalendarClock } from "lucide-react"

import type { Booking } from "@/app/admin/_mock/bookings"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "./confirm-dialog"

async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/admin/auth/me")
    if (!response.ok) return null
    const data = await response.json()
    return data.csrfToken || null
  } catch {
    return null
  }
}

async function cancelBooking(bookingId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const csrfToken = await getCsrfToken()
    if (!csrfToken) {
      return { ok: false, error: "No CSRF token" }
    }

    const response = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: {
        "X-Admin-CSRF": csrfToken,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { ok: false, error: data.message || "Error al cancelar" }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, error: "Error de red" }
  }
}

interface BookingActionsProps {
  booking: Booking
  onView?: (booking: Booking) => void
  compact?: boolean
}

export function BookingActions({ booking, onView, compact = false }: BookingActionsProps) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
  const [isCancelling, setIsCancelling] = React.useState(false)

  const handleCancel = async () => {
    if (!booking.id) return
    
    setIsCancelling(true)
    const result = await cancelBooking(booking.id)
    setIsCancelling(false)
    setCancelOpen(false)
    
    if (result.ok) {
      toast.success("Reserva cancelada correctamente")
      router.refresh()
    } else {
      toast.error(result.error || "Error al cancelar la reserva")
    }
  }

  const handleView = () => {
    if (onView) {
      onView(booking)
    }
  }

  if (compact) {
    return (
      <>
        <div className="inline-flex items-center justify-end gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label={UI_TEXT.actions.view}
              onClick={handleView}
            >
              <Eye className="size-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Abrir menu"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onView && (
                <>
                  <DropdownMenuItem onClick={handleView} className="gap-2">
                    <Eye className="size-4" />
                    {UI_TEXT.actions.view}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => setRescheduleOpen(true)}
                className="gap-2"
              >
                <CalendarClock className="size-4" />
                {UI_TEXT.actions.reschedule}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCancelOpen(true)}
                className="gap-2 text-destructive focus:text-destructive"
                disabled={booking.status === "CANCELLED"}
              >
                <XCircle className="size-4" />
                {UI_TEXT.actions.cancel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ConfirmDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          title={UI_TEXT.dialogs.cancelTitle}
          description={`${booking.uid || booking.id} • ${booking.email || booking.contactEmail}`}
          confirmLabel={UI_TEXT.actions.cancel}
          onConfirm={handleCancel}
        />

        <ConfirmDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          title={UI_TEXT.dialogs.rescheduleTitle}
          description={`${booking.uid || booking.id} • ${booking.email || booking.contactEmail}`}
          confirmLabel={UI_TEXT.actions.reschedule}
          onConfirm={() => {
            toast.message("Reagendada (próximamente)")
          }}
        />
      </>
    )
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
        >
          <Eye className="size-3 mr-1" />
          Ver
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRescheduleOpen(true)}
        >
          <CalendarClock className="size-3 mr-1" />
          Reagendar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCancelOpen(true)}
          className="text-destructive hover:text-destructive"
          disabled={booking.status === "CANCELLED"}
        >
          <XCircle className="size-3 mr-1" />
          Cancelar
        </Button>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={UI_TEXT.dialogs.cancelTitle}
        description={`${booking.uid || booking.id} • ${booking.email || booking.contactEmail}`}
        confirmLabel={UI_TEXT.actions.cancel}
        onConfirm={handleCancel}
      />

      <ConfirmDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        title={UI_TEXT.dialogs.rescheduleTitle}
        description={`${booking.uid || booking.id} • ${booking.email || booking.contactEmail}`}
        confirmLabel={UI_TEXT.actions.reschedule}
        onConfirm={() => {
          toast.message("Reagendada (próximamente)")
        }}
      />
    </>
  )
}
