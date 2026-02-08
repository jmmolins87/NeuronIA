import * as React from "react"
import { CalendarDays, Users, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UI_TEXT } from "@/app/admin/_ui-text"

// Mock metrics data for demo
const metrics = {
  totalBookings: 245,
  newThisWeek: 38,
  completionRate: 87.3,
  noShowRate: 4.2,
  avgResponseTime: "12 min",
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
    { date: "2026-02-08", bookings: 28, completion: 89, noShow: 3 },
    { date: "2026-02-07", bookings: 32, completion: 85, noShow: 2 },
    { date: "2026-02-06", bookings: 25, completion: 88, noShow: 4 },
    { date: "2026-02-05", bookings: 30, completion: 90, noShow: 1 },
    { date: "2026-02-04", bookings: 27, completion: 85, noShow: 2 },
    { date: "2026-02-03", bookings: 33, completion: 82, noShow: 3 },
    { date: "2026-02-02", bookings: 29, completion: 86, noShow: 2 },
    { date: "2026-02-01", bookings: 35, completion: 88, noShow: 4 },
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

export default function AdminMetricsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Métricas del Sistema
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Datos en tiempo real del rendimiento del sistema
          </p>
        </div>
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
            <p className="text-xs text-muted-foreground">+15.3% vs semana anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Completación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">De las reservas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa No-Show</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.noShowRate}%</div>
            <p className="text-xs text-muted-foreground">Por debajo del objetivo 5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Booking Times */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horarios Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topBookingTimes.map((slot, index) => (
                <div key={slot.hour} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{slot.hour}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{slot.count} reservas</div>
                    <div className="text-xs text-muted-foreground">{slot.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendimiento Diario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentPerformance.slice(0, 7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-green-600">{day.completed}✓</span>
                    {day.noShow > 0 && (
                      <span className="text-red-600">{day.noShow}✗</span>
                    )}
                    <span className="text-muted-foreground">/ {day.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
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
              <p className="text-xs text-muted-foreground">Completadas ({metrics.conversionStats.completionPercentage}%)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.conversionStats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Canceladas ({metrics.conversionStats.cancellationRate}%)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.conversionStats.rescheduled}</div>
              <p className="text-xs text-muted-foreground">Reagendadas ({metrics.conversionStats.rescheduleRate}%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <p className="text-xs text-muted-foreground">Basado en reservas completadas</p>
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
    </div>
  )
}