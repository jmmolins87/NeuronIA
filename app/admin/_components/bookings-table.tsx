"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, MoreHorizontal, XCircle, CalendarClock } from "lucide-react"

import type { Booking } from "@/app/admin/_mock/bookings"
import { formatDateTime } from "@/app/admin/_lib/format"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { BookingSheet } from "@/app/admin/_components/booking-sheet"
import { ConfirmDialog } from "@/app/admin/_components/confirm-dialog"
import { EmptyState } from "@/app/admin/_components/empty-state"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()
  const [selected, setSelected] = React.useState<Booking | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)
  const [isCancelling, setIsCancelling] = React.useState(false)

  if (bookings.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">{UI_TEXT.bookingsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Fecha/hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} className="group">
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(b.startAt)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="hover:text-foreground text-muted-foreground underline underline-offset-4"
                    >
                      {b.email}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="uppercase text-xs text-muted-foreground">
                    {b.locale}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDateTime(b.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        aria-label={UI_TEXT.actions.view}
                        onClick={() => {
                          setSelected(b)
                          setSheetOpen(true)
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelected(b)
                              setSheetOpen(true)
                            }}
                            className="gap-2"
                          >
                            <Eye className="size-4" />
                            {UI_TEXT.actions.view}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelected(b)
                              setRescheduleOpen(true)
                            }}
                            className="gap-2"
                          >
                            <CalendarClock className="size-4" />
                            {UI_TEXT.actions.reschedule}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelected(b)
                              setCancelOpen(true)
                            }}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <XCircle className="size-4" />
                            {UI_TEXT.actions.cancel}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingSheet
        booking={selected}
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) setSelected(null)
        }}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={UI_TEXT.dialogs.cancelTitle}
        description={selected ? `${selected.uid || selected.id} • ${selected.email || selected.contactEmail}` : UI_TEXT.dialogs.cancelDescription}
        confirmLabel={UI_TEXT.actions.cancel}
        onConfirm={async () => {
          if (!selected?.id) return
          
          setIsCancelling(true)
          const result = await cancelBooking(selected.id)
          setIsCancelling(false)
          setCancelOpen(false)
          
          if (result.ok) {
            toast.success("Reserva cancelada correctamente")
            // Reload page to show updated data
            router.refresh()
          } else {
            toast.error(result.error || "Error al cancelar la reserva")
          }
        }}
      />

      <ConfirmDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        title={UI_TEXT.dialogs.rescheduleTitle}
        description={selected ? `${selected.id} • ${selected.email}` : UI_TEXT.dialogs.rescheduleDescription}
        confirmLabel={UI_TEXT.actions.reschedule}
        onConfirm={() => {
          toast.message("Reagendada (mock)")
        }}
      />
    </>
  )
}
