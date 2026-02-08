import * as React from "react"
import { CalendarDays, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UI_TEXT } from "@/app/admin/_ui-text"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export default async function AdminMetricsPage() {
  // Check if we're in demo mode
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get('clinvetia_admin')?.value
  const isDemo = demoCookie === 'demo-session'

  // Get real metrics data
  const metrics = isDemo ? null : await getRealMetrics()

  function getRealMetrics() {
    return prisma.$transaction(async (tx) => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [
        totalBookings,
        recentBookings,
        statusCounts,
        // Get some completed bookings for revenue calculation
        completedBookings,
      ] = await Promise.all([
        // Total in last 30 days
        tx.booking.count({
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        
        // New this week
        tx.booking.count({
          where: {
            createdAt: { gte: oneWeekAgo }
          }
        }),
        
        // Count by status
        tx.booking.groupBy({
          by: ['status'],
          _count: true,
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        
        // Some recent completed bookings for demo revenue
        tx.booking.findMany({
          take: 50,
          where: {
            status: 'CONFIRMED',
            createdAt: { gte: thirtyDaysAgo }
          },
          select: {
            id: true,
          }
        }),
      ])

      const statusCountsMap = statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>)

      const confirmed = statusCountsMap['CONFIRMED'] || 0
      const cancelled = statusCountsMap['CANCELLED'] || 0
      const rescheduled = statusCountsMap['RESCHEDULED'] || 0
      const total = confirmed + cancelled + rescheduled
      
      return {
        totalBookings,
        newThisWeek: recentBookings,
        completionRate: total > 0 ? (confirmed / total) * 100 : 0,
        noShowRate: 0, // We'd need more complex logic to calculate this
        avgBookingValue: 95.50, // Would need ROI data integration
        monthlyRevenue: confirmed * 95.50,
        conversionStats: {
          total,
          completed: confirmed,
          cancelled: cancelled,
          rescheduled: rescheduled,
          completionPercentage: total > 0 ? (confirmed / total) * 100 : 0,
          cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
          rescheduleRate: total > 0 ? (rescheduled / total) * 100 : 0,
        }
      }
    })
  }

  if (isDemo) {
    // Show mock metrics for demo
    const mockMetrics = {
      totalBookings: 245,
      newThisWeek: 38,
      completionRate: 87.3,
      noShowRate: 4.2,
      avgBookingValue: 95.50,
      monthlyRevenue: 23397.50,
      topBookingTimes: [
        { hour: "09:00", count: 45, percentage: 18.4 },
        { hour: "10:00", count: 38, percentage: 15.5 },
        { hour: "11:00", count: 42, percentage: 17.1 },
        { hour: "16:00", count: 35, percentage: 14.3 },
        { hour: "17:00", count: 28, percentage: 11.4 },
      ],
      recentPerformance: [
        { date: "2026-02-08", bookings: 28, completed: 25, noShow: 3 },
        { date: "2026-02-07", bookings: 32, completed: 27, noShow: 5 },
        { date: "2026-02-06", bookings: 25, completed: 22, noShow: 3 },
        { date: "2026-02-05", bookings: 30, completed: 27, noShow: 3 },
        { date: "2026-02-04", bookings: 27, completed: 23, noShow: 4 },
        { date: "2026-02-03", bookings: 33, completed: 27, noShow: 6 },
        { date: "2026-02-02", bookings: 29, completed: 25, noShow: 4 },
        { date: "2026-02-01", bookings: 35, completed: 31, noShow: 4 },
      ],
      conversionStats: {
        total: 1256,
        completed: 1095,
        cancelled: 98,
        rescheduled: 63,
        completionPercentage: 87.2,
        cancellationRate: 7.8,
        rescheduleRate: 5.0,
      }
    }

    return <MetricsContent metrics={mockMetrics} isDemo={true} />
  }

  // Show real metrics or empty state
  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Métricas del Sistema
          </h1>
          <p className="text-muted-foreground text-sm">
            Error al cargar métricas. Por favor, recarga la página.
          </p>
        </div>
      </div>
    )
  }

  return <MetricsContent metrics={metrics} isDemo={false} />
}

interface MetricsContentProps {
  metrics: any
  isDemo: boolean
}

function MetricsContent({ metrics, isDemo }: MetricsContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Métricas del Sistema
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isDemo ? "Datos de demostración en tiempo real" : "Datos en tiempo real del rendimiento del sistema"}
          </p>
        </div>
        {isDemo && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
              Modo Demo
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{metrics.newThisWeek}</div>
            <p className="text-xs text-muted-foreground">{isDemo ? "+15.3% vs semana anterior" : "Esta semana"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Completación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">De las reservas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa No-Show</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.noShowRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Por debajo del objetivo 5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              €{metrics.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{isDemo ? "Basado en reservas completadas" : "Estimado de reservas confirmadas"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor Promedio por Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              €{metrics.avgBookingValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ticket promedio del mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estadísticas de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.conversionStats.total}</div>
              <p className="text-xs text-muted-foreground">Total Reservas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.conversionStats.completed}</div>
              <p className="text-xs text-muted-foreground">Completadas ({metrics.conversionStats.completionPercentage.toFixed(1)}%)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.conversionStats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Canceladas ({metrics.conversionStats.cancellationRate.toFixed(1)}%)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.conversionStats.rescheduled}</div>
              <p className="text-xs text-muted-foreground">Reagendadas ({metrics.conversionStats.rescheduleRate.toFixed(1)}%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isDemo && metrics.totalBookings === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No hay datos suficientes para mostrar métricas. 
              Las métricas aparecerán cuando haya reservas en el sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}