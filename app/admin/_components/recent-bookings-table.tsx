"use client"

import * as React from "react"
import { formatDateTime } from "@/app/admin/_lib/format"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { BookingActions } from "@/app/admin/_components/booking-actions"
import { BookingSheet } from "@/app/admin/_components/booking-sheet"
import type { Booking } from "@/app/admin/_mock/bookings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RecentBookingsTableProps {
  bookings: Booking[]
  isDemo?: boolean
}

export function RecentBookingsTable({ bookings, isDemo = false }: RecentBookingsTableProps) {
  const [selected, setSelected] = React.useState<Booking | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">{UI_TEXT.sections.recentBookings}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Fecha/hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                    {isDemo ? UI_TEXT.empty.title : "No hay reservas recientes"}
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(b.startAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-muted-foreground">
                      {b.email || b.contactEmail}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDateTime(b.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <BookingActions 
                        booking={b} 
                        onView={(booking) => {
                          setSelected(booking)
                          setSheetOpen(true)
                        }}
                        compact
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
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
    </>
  )
}
