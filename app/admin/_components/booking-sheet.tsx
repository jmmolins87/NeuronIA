"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Copy, ExternalLink } from "lucide-react"

import type { Booking } from "@/app/admin/_mock/bookings"
import { formatDateTime, statusLabel } from "@/app/admin/_lib/format"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { UI_TEXT } from "@/app/admin/_ui-text"

function Kv({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

export function BookingSheet({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null
  open: boolean
  onOpenChange: (next: boolean) => void
}) {
  const title = booking ? `${booking.uid || booking.id}` : UI_TEXT.actions.view
  const clientName: string = booking?.name || booking?.contactName || "Sin nombre"
  const clientEmail: string = booking?.email || booking?.contactEmail || "Sin email"
  const duration: number = booking?.durationMinutes || 30

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-3">
            <span className="truncate">{title}</span>
            {booking ? <StatusBadge status={booking.status} /> : null}
          </SheetTitle>
          <SheetDescription>
            {booking ? `${formatDateTime(booking.startAt)} • ${duration}m • ${statusLabel(booking.status)}` : ""}
          </SheetDescription>
        </SheetHeader>

        {booking ? (
          <div className="grid gap-4 px-4 pb-4">
            <Card className="p-4">
              <div className="text-sm font-semibold">Cliente</div>
              <div className="text-muted-foreground mt-1 text-sm">{clientName}</div>
              <div className="mt-3 border-t pt-3">
                <Kv label="Email" value={clientEmail} />
                {booking.locale && <Kv label="Locale" value={booking.locale} />}
                {booking.contactPhone && <Kv label="Teléfono" value={booking.contactPhone} />}
                {booking.contactClinicName && <Kv label="Clínica" value={booking.contactClinicName} />}
                <Kv label="Creada" value={formatDateTime(booking.createdAt)} />
              </div>
            </Card>

            {booking.form && (
              <Card className="p-4">
                <div className="text-sm font-semibold">Formulario</div>
                <div className="mt-3 space-y-2">
                  <Kv label="Empresa" value={booking.form.company} />
                  <Kv label="Rol" value={booking.form.role} />
                  <Kv label="Tamano" value={booking.form.clinicSize} />
                </div>
              </Card>
            )}
          </div>
        ) : null}

        <SheetFooter className="gap-2">
          {booking ? (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(clientEmail)
                    toast.success("Email copiado")
                  } catch {
                    toast.error("No se pudo copiar")
                  }
                }}
              >
                <Copy className="size-4" />
                {UI_TEXT.actions.copyEmail}
              </Button>
              <Button className="gap-2 bg-gradient-neon-glow glow-sm" asChild>
                <Link href={`/admin/bookings/${booking.id}`}>
                  <ExternalLink className="size-4" />
                  {UI_TEXT.actions.open}
                </Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
