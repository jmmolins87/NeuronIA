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

function getState(searchParams?: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.state
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === "loading" || value === "empty" || value === "error") return value
  return "ready"
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const state = getState(resolved)
  const rows = state === "empty" ? [] : BOOKINGS
  const recent = rows.slice(0, 5)

  const total = rows.length
  const confirmed = rows.filter((b) => b.status === "CONFIRMED").length
  const cancelled = rows.filter((b) => b.status === "CANCELLED").length
  const rescheduled = rows.filter((b) => b.status === "RESCHEDULED").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {UI_TEXT.overviewTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {UI_TEXT.overviewSubtitle}
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
            hint="Ultimos 14 dias (mock)"
            icon={CalendarDays}
          />
          <KpiCard
            title={UI_TEXT.kpi.confirmed}
            value={String(confirmed)}
            hint="En estado Confirmed"
            icon={CircleCheck}
            tone="good"
          />
          <KpiCard
            title={UI_TEXT.kpi.cancelled}
            value={String(cancelled)}
            hint="Incluye cancelaciones manuales"
            icon={XCircle}
            tone="bad"
          />
          <KpiCard
            title={UI_TEXT.kpi.rescheduled}
            value={String(rescheduled)}
            hint="Cambios de agenda"
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
                        {UI_TEXT.empty.title}
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
              <CardTitle className="text-base">{UI_TEXT.sections.activity}</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline events={ACTIVITY} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
