import { UI_TEXT } from "@/app/admin/_ui-text"
import { FiltersBar } from "@/app/admin/_components/filters-bar"
import { BookingsTable } from "@/app/admin/_components/bookings-table"
import { ErrorBanner } from "@/app/admin/_components/error-banner"
import { TableSkeleton } from "@/app/admin/_components/skeletons"
import { PaginationBar } from "@/app/admin/_components/pagination-bar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

function getState(searchParams?: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.state
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === "loading" || value === "empty" || value === "error") return value
  return "ready"
}

async function getRealBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      take: 50, // Limit for performance
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        uid: true,
        status: true,
        startAt: true,
        endAt: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        contactClinicName: true,
        createdAt: true,
        updatedAt: true,
        rescheduledToBookingId: true,
      }
    })

    return bookings
  } catch (error) {
    console.error('Error fetching real bookings:', error)
    return null
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolved = searchParams ? await searchParams : undefined
  const state = getState(resolved)
  
  // Check if we're in demo mode
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get('clinvetia_admin')?.value
  const isDemo = demoCookie === 'demo-session'
  
  let rows
  
  if (isDemo) {
    // Import mock data only for demo
    const { BOOKINGS } = await import("@/app/admin/_mock/bookings")
    rows = state === "empty" ? [] : BOOKINGS
  } else {
    // Use real data for production
    rows = await getRealBookings()
    
    if (!rows) {
      return (
        <div className="space-y-6">
          <ErrorBanner onRetry={() => {}} />
        </div>
      )
    }
  }

  const total = rows.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {UI_TEXT.bookingsTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {UI_TEXT.bookingsSubtitle}
            {isDemo && <span className="ml-2 text-xs text-yellow-600">(Datos Demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDemo && total > 0 && (
            <Badge variant="secondary" className="text-xs">
              {total} resultados
            </Badge>
          )}
          {isDemo && (
            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
              Modo Demo
            </Badge>
          )}
        </div>
      </div>

      <FiltersBar />

      {state === "loading" ? (
        <TableSkeleton rows={10} />
      ) : (
        <BookingsTable bookings={rows} />
      )}

      {state !== "loading" && rows.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {isDemo 
              ? "Mostrando datos de demostración"
              : `Mostrando ${Math.min(total, 50)} reservas más recientes`
            }
          </div>
          <PaginationBar currentPage={1} totalPages={1} />
        </div>
      )}
    </div>
  )
}