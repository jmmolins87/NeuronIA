"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CalendarDays, ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { BOOKINGS, type Booking } from "@/app/admin/_mock/bookings"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { formatDateTime } from "@/app/admin/_lib/format"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/modal"

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

function dayKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function sameDay(a: Date, b: Date): boolean {
  return dayKeyLocal(a) === dayKeyLocal(b)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

// Monday-first (0..6 where 0 = Monday)
function weekdayMondayIndex(d: Date): number {
  const day = d.getDay() // 0=Sun
  return (day + 6) % 7
}

function formatCalendarTitle(d: Date): string {
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function bookingsForDay(day: Date): Booking[] {
  return BOOKINGS.filter((b) => sameDay(new Date(b.startAt), day)).sort((a, b) => {
    return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  })
}

function statusInitial(status: Booking["status"]): string {
  switch (status) {
    case "CONFIRMED":
      return "C"
    case "CANCELLED":
      return "X"
    case "RESCHEDULED":
      return "R"
    case "HELD":
      return "H"
    case "EXPIRED":
      return "E"
  }
}

function DetailPanel({ booking }: { booking: Booking }) {
  return (
    <Card className="overflow-hidden">
      <div aria-hidden className="h-1 w-full bg-gradient-to-r from-gradient-from to-gradient-to" />
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between gap-3 text-base">
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{booking.name}</span>
          <StatusBadge status={booking.status} />
        </CardTitle>
        <CardDescription className="break-words [overflow-wrap:anywhere]">
          {booking.email} • {formatDateTime(booking.startAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/10 p-4">
            <div className="text-muted-foreground text-xs font-medium">Cita</div>
            <div className="mt-2 text-sm font-semibold">{formatDateTime(booking.startAt)}</div>
            <div className="text-muted-foreground mt-1 text-sm">Duracion: {booking.durationMinutes} min</div>
            <div className="mt-3">
              <StatusBadge status={booking.status} />
            </div>
          </div>
          <div className="rounded-xl border bg-muted/10 p-4">
            <div className="text-muted-foreground text-xs font-medium">Cliente</div>
            <div className="mt-2 text-sm font-semibold">{booking.name}</div>
            <div className="text-muted-foreground mt-1 text-sm">{booking.email}</div>
            <div className="mt-3 text-xs text-muted-foreground">Locale: {booking.locale.toUpperCase()}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-background/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Formulario</div>
            <Badge variant="outline">Mock</Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          </div>
          <div className="mt-4">
            <div className="text-muted-foreground text-xs font-medium">Notas (usuario)</div>
            <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/10 p-3 text-sm">
              {booking.form.notes}
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link className="cursor-pointer" href={`/admin/bookings/${booking.id}`}>
            Abrir detalle completo
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function CalendarView() {
  const [month, setMonth] = React.useState(() => startOfMonth(new Date()))
  const [open, setOpen] = React.useState(false)
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null)
  const [panel, setPanel] = React.useState<"list" | "detail">("list")

  const first = startOfMonth(month)
  const firstWeekday = weekdayMondayIndex(first)
  const totalDays = daysInMonth(month)

  const gridSlots = Math.ceil((firstWeekday + totalDays) / 7) * 7

  const today = new Date()

  const dayCells: Array<{ date: Date | null; dayNumber?: number }> = []
  for (let i = 0; i < gridSlots; i++) {
    const dayIndex = i - firstWeekday + 1
    if (dayIndex < 1 || dayIndex > totalDays) {
      dayCells.push({ date: null })
      continue
    }
    const d = new Date(month.getFullYear(), month.getMonth(), dayIndex)
    dayCells.push({ date: d, dayNumber: dayIndex })
  }

  const dayBookings = selectedDay ? bookingsForDay(selectedDay) : []
  const selectedBooking =
    selectedBookingId && dayBookings.find((b) => b.id === selectedBookingId)
      ? dayBookings.find((b) => b.id === selectedBookingId)!
      : dayBookings[0] ?? null

  React.useEffect(() => {
    if (!open) {
      setSelectedDay(null)
      setSelectedBookingId(null)
      setPanel("list")
    }
  }, [open])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{UI_TEXT.sections.calendar}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vista mensual. Pulsa un dia para ver citas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setMonth((m) => startOfMonth(new Date(m.getFullYear(), m.getMonth() - 1, 1)))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <div className="rounded-lg border bg-card px-4 py-2 text-sm font-semibold capitalize">
            {formatCalendarTitle(month)}
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setMonth((m) => startOfMonth(new Date(m.getFullYear(), m.getMonth() + 1, 1)))}
            aria-label="Mes siguiente"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4 text-muted-foreground" />
            Calendario
          </CardTitle>
          <CardDescription>
            Dots y contadores indican cuantas citas hay por dia (mock).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["L", "M", "X", "J", "V", "S", "D"].map((w) => (
              <div key={w} className="text-muted-foreground py-1 text-center text-xs font-medium">
                {w}
              </div>
            ))}

            {dayCells.map((cell, idx) => {
              if (!cell.date) {
                return <div key={`empty-${idx}`} className="aspect-square" />
              }

              const count = bookingsForDay(cell.date).length
              const isToday = sameDay(cell.date, today)

              return (
                <button
                  key={dayKeyLocal(cell.date)}
                  type="button"
                  onClick={() => {
                    setSelectedDay(cell.date)
                    setSelectedBookingId(null)
                    setOpen(true)
                  }}
                  className={cn(
                    "cursor-pointer group relative aspect-square rounded-xl border bg-card p-2 text-left transition-colors",
                    "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isToday && "border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className={cn("text-sm font-semibold", isToday && "text-gradient-to dark:text-primary")}> 
                      {cell.dayNumber}
                    </div>
                    {count > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/15">
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {count === 0 ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      bookingsForDay(cell.date)
                        .slice(0, 3)
                        .map((b) => (
                          <span
                            key={b.id}
                            aria-hidden
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-xs",
                              b.status === "CONFIRMED" && "bg-emerald-500",
                              b.status === "CANCELLED" && "bg-destructive",
                              b.status === "RESCHEDULED" && "bg-amber-500",
                              (b.status === "HELD" || b.status === "EXPIRED") && "bg-muted-foreground/75"
                            )}
                          >
                            {statusInitial(b.status)}
                          </span>
                        ))
                    )}
                    {count > 3 ? (
                      <span className="text-muted-foreground text-xs">+{count - 3}</span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={selectedDay ? formatDayLabel(selectedDay) : "Citas"}
        description={
          selectedDay
            ? `${dayBookings.length} cita(s) • Pulsa una para ver el formulario`
            : undefined
        }
        contentClassName="max-w-[980px]"
        bodyScroll="none"
        bodyClassName="pr-0"
        closeAriaLabel="Close"
      >
        <div className="relative overflow-hidden">
          <div
            className={cn(
              "flex w-[200%] transition-transform duration-300 ease-out motion-reduce:transition-none",
              panel === "detail" ? "-translate-x-1/2" : "translate-x-0"
            )}
          >
            <div className="w-1/2 px-0">
              <div className="h-[calc(80vh-12rem)] overflow-auto overflow-x-hidden pr-4">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-base">Citas del dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dayBookings.length === 0 ? (
                      <div className="text-muted-foreground py-8 text-center text-sm">
                        No hay citas para este dia.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayBookings.map((b) => {
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setSelectedBookingId(b.id)
                                setPanel("detail")
                              }}
                              className={cn(
                                "cursor-pointer w-full rounded-xl border p-3 text-left transition-colors",
                                "hover:bg-muted/30",
                                "bg-background/40"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold break-words [overflow-wrap:anywhere]">
                                    {b.name}
                                  </div>
                                  <div className="text-muted-foreground mt-0.5 text-sm break-words [overflow-wrap:anywhere]">
                                    {formatDateTime(b.startAt)} • {b.email}
                                  </div>
                                </div>
                                <StatusBadge status={b.status} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="w-1/2 px-0">
              <div className="h-[calc(80vh-12rem)] overflow-auto overflow-x-hidden pr-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setPanel("list")
                    }}
                  >
                    <ArrowLeft className="size-4" />
                    Volver
                  </Button>
                  {selectedBooking ? (
                    <Button asChild variant="outline">
                      <Link className="cursor-pointer" href={`/admin/bookings/${selectedBooking.id}`}>
                        Abrir detalle
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {selectedBooking ? (
                  <DetailPanel booking={selectedBooking} />
                ) : (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Sin seleccion</CardTitle>
                      <CardDescription>
                        Selecciona una cita para ver el formulario.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
