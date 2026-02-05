import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { BOOKINGS } from "@/app/admin/_mock/bookings"
import { formatDate, formatDateTime } from "@/app/admin/_lib/format"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { InternalNotesCard } from "@/app/admin/(app)/bookings/[id]/_components/internal-notes-card"
import { BookingActionsCard } from "@/app/admin/(app)/bookings/[id]/_components/booking-actions-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const booking = BOOKINGS.find((b) => b.id === id)
  if (!booking) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/admin/bookings" className="text-muted-foreground hover:text-foreground">
          Bookings
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="font-medium">#{booking.id}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{booking.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{booking.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{UI_TEXT.sections.booking}</CardTitle>
              <CardDescription>Informacion de la cita (mock)</CardDescription>
            </CardHeader>
            <CardContent>
              <Kv label="Fecha/hora" value={formatDateTime(booking.startAt)} />
              <Kv label="Duracion" value={`${booking.durationMinutes} min`} />
              <Kv label="Estado" value={booking.status} />
              <Kv label="Creada" value={formatDateTime(booking.createdAt)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{UI_TEXT.sections.customer}</CardTitle>
            </CardHeader>
            <CardContent>
              <Kv label="Nombre" value={booking.name} />
              <Kv label="Email" value={booking.email} />
              <Kv label="Locale" value={booking.locale.toUpperCase()} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{UI_TEXT.sections.roi}</CardTitle>
              <CardDescription>Parametros estimados (solo UI)</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Leads/mes</TableCell>
                    <TableCell className="text-right font-medium">
                      {booking.roi.currentLeadsPerMonth}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Ticket medio (EUR)</TableCell>
                    <TableCell className="text-right font-medium">{booking.roi.avgTicketEur}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Conversion (%)</TableCell>
                    <TableCell className="text-right font-medium">{booking.roi.conversionRatePct}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">Uplift estimado (%)</TableCell>
                    <TableCell className="text-right font-medium">{booking.roi.estimatedUpliftPct}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">{UI_TEXT.sections.form}</CardTitle>
              <CardDescription>Campos enviados (mock)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground text-xs font-medium">Empresa</div>
                  <div className="mt-1 text-sm font-medium">{booking.form.company}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium">Rol</div>
                  <div className="mt-1 text-sm font-medium">{booking.form.role}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium">Tamano</div>
                  <div className="mt-1 text-sm font-medium">{booking.form.clinicSize}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium">Objetivos</div>
                  <div className="mt-1 text-sm">{booking.form.goals}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium">Notas</div>
                  <div className="mt-1 text-sm">{booking.form.notes}</div>
                </div>
                <div className="pt-2 text-xs text-muted-foreground">
                  Creada: {formatDate(booking.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <InternalNotesCard initialValue="" />

          <BookingActionsCard email={booking.email} bookingId={booking.id} />
        </div>
      </div>
    </div>
  )
}
