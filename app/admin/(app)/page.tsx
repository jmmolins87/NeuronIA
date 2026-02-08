import { ActivityTimeline } from "@/app/admin/_components/activity-timeline"
import { DateRangeChip } from "@/app/admin/_components/date-range-chip"
import { ErrorBanner } from "@/app/admin/_components/error-banner"
import { KpiCard } from "@/app/admin/_components/kpi-card"
import { KpiGridSkeleton, TableSkeleton } from "@/app/admin/_components/skeletons"
import { StatusBadge } from "@/app/admin/_components/status-badge"
import { ACTIVITY, BOOKINGS } from "@/app/admin/_mock/bookings"
import { formatDateTime } from "@/app/admin/_lib/format"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, CircleCheck, RotateCcw, XCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

function getState(searchParams?: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.state
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === "loading" || value === "empty" || value === "error") return value
  return "ready"
}

async function getRealData() {
  try {
    // Fetch real data from database
    const [totalBookings, bookingsByStatus, recentBookings, recentActivity] = await Promise.all([
      
      // Total count
      prisma.booking.count(),
      
      // Count by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: true,
      }),
      
      // Recent bookings (last 5)
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uid: true,
          status: true,
          startAt: true,
          contactEmail: true,
          createdAt: true,
        }
      }),
      
      // Recent activity (admin audit)
      prisma.bookingAdminAudit.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              username: true,
            }
          },
          booking: {
            select: {
              uid: true,
              contactEmail: true,
            }
          }
        }
      })
    ])

    // Process status counts
    const statusCounts = bookingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    // Process activity for timeline
    const timelineEvents = recentActivity.map(event => ({
      id: `ACT-${event.id}`,
      at: event.createdAt.toISOString(),
      title: `${event.action} por ${event.admin.username}`,
      description: `Reserva ${event.booking?.uid || event.bookingId} - ${event.booking?.contactEmail || ''}`,
      tone: event.action === 'CANCEL' ? 'bad' : event.action === 'RESCHEDULE' ? 'warn' : 'neutral' as const,
    }))

    return {
      bookings: recentBookings.map(booking => ({
        id: booking.id,
        uid: booking.uid,
        status: booking.status,
        email: booking.contactEmail || '',
        startAt: booking.startAt.toISOString(),
        createdAt: booking.createdAt.toISOString(),
      })),
      total: totalBookings,
      confirmed: statusCounts['CONFIRMED'] || 0,
      cancelled: statusCounts['CANCELLED'] || 0,
      rescheduled: statusCounts['RESCHEDULED'] || 0,
      activity: timelineEvents,
    }
  } catch (error) {
    console.error('Error fetching real admin data:', error)
    return null
  }
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const state = getState(resolved)
  
  // Check if we're in demo mode by checking cookies
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get('clinvetia_admin')?.value
  const isDemo = demoCookie === 'demo-session'
  
  let rows, recent, total, confirmed, cancelled, rescheduled, activity
  
  if (isDemo) {
    // Use mock data for demo
    rows = state === "empty" ? [] : BOOKINGS
    recent = rows.slice(0, 5)
    total = rows.length
    confirmed = rows.filter((b) => b.status === "CONFIRMED").length
    cancelled = rows.filter((b) => b.status === "CANCELLED").length
    rescheduled = rows.filter((b) => b.status === "RESCHEDULED").length
    activity = ACTIVITY.slice(0, 5)
  } else {
    // Use real data for production/superadmin
    const realData = await getRealData()
    
    if (!realData) {
      // Show error state if database fails
      return (
        <div className="space-y-6">
          <ErrorBanner onRetry={() => {}} />
        </div>
      )
    }
    
    rows = realData.bookings
    recent = rows
    total = realData.total
    confirmed = realData.confirmed
    cancelled = realData.cancelled
    rescheduled = realData.rescheduled
    activity = realData.activity
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {UI_TEXT.overviewTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {UI_TEXT.overviewSubtitle}
            {isDemo && <span className="ml-2 text-xs text-yellow-600">(Modo Demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeChip />
        </div>
      </div>

      {state === "error" ? (
        <ErrorBanner onRetry={() => {}} />
      ) : null}

      {state === "loading" ? (
        <KpiGridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title={UI_TEXT.kpi.total}
            value={String(total)}
            hint={isDemo ? "Datos de demostración" : "Últimos 30 días"}
            icon={CalendarDays}
          />
          <KpiCard
            title={UI_TEXT.kpi.confirmed}
            value={String(confirmed)}
            hint="Confirmadas"
            icon={CircleCheck}
            tone="good"
          />
          <KpiCard
            title={UI_TEXT.kpi.cancelled}
            value={String(cancelled)}
            hint="Cancelaciones"
            icon={XCircle}
            tone="bad"
          />
          <KpiCard
            title={UI_TEXT.kpi.rescheduled}
            value={String(rescheduled)}
            hint="Reagendadas"
            icon={RotateCcw}
            tone="warn"
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {state === "loading" ? (
          <TableSkeleton rows={6} />
        ) : (
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
                    <TableHead className="text-right">Creada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                        {isDemo ? UI_TEXT.empty.title : "No hay reservas recientes"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(b.startAt)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={b.status} />
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-muted-foreground">
                          {b.email}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                          {formatDateTime(b.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {state === "loading" ? (
          <div className="rounded-xl border bg-card px-6 py-6">
            <div className="text-muted-foreground text-sm">Actividad</div>
            <div className="mt-4 space-y-3">
              <div className="h-10 w-full rounded-md bg-muted/50 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/50 animate-pulse" />
              <div className="h-10 w-full rounded-md bg-muted/50 animate-pulse" />
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                {UI_TEXT.sections.activity}
                {isDemo && <span className="ml-2 text-xs text-yellow-600">(Demo)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline events={activity} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}