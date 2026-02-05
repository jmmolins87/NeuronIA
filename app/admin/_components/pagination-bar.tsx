"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PaginationBar({
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  page: number
  pageCount: number
  onPrev?: () => void
  onNext?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-muted-foreground text-sm">
        Pagina <span className="text-foreground font-medium">{page}</span> de{" "}
        <span className="text-foreground font-medium">{pageCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={onPrev}>
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onNext}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
