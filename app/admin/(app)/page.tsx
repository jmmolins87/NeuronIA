import { ActivityTimeline } from "@/app/admin/_components/activity-timeline"
import { DateRangeChip } from "@/app/admin/_components/date-range-chip"
import { ErrorBanner } from "@/app/admin/_components/error-banner"
import { KpiCard } from "@/app/admin/_components/kpi-card"
import { KpiGridSkeleton, TableSkeleton } from "@/app/admin/_components/skeletons"
import { RecentBookingsTable } from "@/app/admin/_components/recent-bookings-table"
import { ACTIVITY, BOOKINGS, type ActivityEvent } from "@/app/admin/_mock/bookings"
import { formatDateTime } from "@/app/admin/_lib/format"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, CircleCheck, RotateCcw, XCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentAdmin } from "@/lib/admin-auth-v2"

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
      tone: (event.action === 'CANCEL' ? 'bad' : event.action === 'RESCHEDULE' ? 'warn' : 'neutral') as "bad" | "warn" | "neutral" | "good",
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
  
  // Check if we're in demo mode based on user session
  const session = await getCurrentAdmin()
  const isDemo = session?.admin.mode === 'DEMO'
  
  let rows, recent, total, confirmed, cancelled, rescheduled
  let activity: ActivityEvent[]
  
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
    activity = realData.activity as ActivityEvent[]
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
          <RecentBookingsTable bookings={recent} isDemo={isDemo} />
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