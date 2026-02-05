import { BOOKINGS } from "@/app/admin/_mock/bookings"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { FiltersBar } from "@/app/admin/_components/filters-bar"
import { BookingsTable } from "@/app/admin/_components/bookings-table"
import { ErrorBanner } from "@/app/admin/_components/error-banner"
import { TableSkeleton } from "@/app/admin/_components/skeletons"
import { PaginationBar } from "@/app/admin/_components/pagination-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function getState(searchParams?: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.state
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === "loading" || value === "empty" || value === "error") return value
  return "ready"
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const state = getState(resolved)
  const rows = state === "empty" ? [] : BOOKINGS

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{UI_TEXT.bookingsTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{UI_TEXT.bookingsSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled className="gap-2">
            {UI_TEXT.actions.exportCsv}
            <Badge variant="outline">Soon</Badge>
          </Button>
          <Button disabled className="gap-2 bg-gradient-neon-glow glow-sm">
            {UI_TEXT.actions.newBooking}
            <Badge variant="outline">Soon</Badge>
          </Button>
        </div>
      </div>

      {state === "error" ? <ErrorBanner onRetry={() => {}} /> : null}

      <FiltersBar />

      {state === "loading" ? <TableSkeleton rows={10} /> : <BookingsTable bookings={rows} />}

      <div className="rounded-xl border bg-card px-6 py-4">
        <PaginationBar page={1} pageCount={3} />
      </div>
    </div>
  )
}
