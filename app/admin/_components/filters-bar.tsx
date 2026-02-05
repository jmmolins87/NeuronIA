"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function FiltersBar() {
  const [q, setQ] = React.useState("")
  const [status, setStatus] = React.useState("ALL")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [pageSize, setPageSize] = React.useState("10")

  return (
    <Card className="px-6 py-4">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.7fr]">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {UI_TEXT.filters.searchLabel}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={UI_TEXT.filters.searchPlaceholder}
              className="pl-8"
              aria-label={UI_TEXT.filters.searchLabel}
            />
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {UI_TEXT.filters.statusLabel}
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label={UI_TEXT.filters.statusLabel}
          >
            <option value="ALL">All</option>
            <option value="HELD">HELD</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="RESCHEDULED">RESCHEDULED</option>
            <option value="EXPIRED">EXPIRED</option>
          </Select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {UI_TEXT.filters.dateFrom}
          </label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label={UI_TEXT.filters.dateFrom}
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {UI_TEXT.filters.dateTo}
          </label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label={UI_TEXT.filters.dateTo}
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {UI_TEXT.filters.pageSize}
          </label>
          <Select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            aria-label={UI_TEXT.filters.pageSize}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </Select>
        </div>
      </div>
      <div className="text-muted-foreground mt-3 text-xs">
        UI only: los filtros no cambian los datos (listo para wiring).
      </div>
    </Card>
  )
}
