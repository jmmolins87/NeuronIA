import Link from "next/link"

import { cn } from "@/lib/utils"
import type { ActivityEvent } from "@/app/admin/_mock/bookings"
import { formatDateTime } from "@/app/admin/_lib/format"

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((e) => (
        <div key={e.id} className="flex items-start gap-3">
          <div
            aria-hidden
            className={cn(
              "mt-1 size-2 rounded-full",
              e.tone === "good" && "bg-emerald-500",
              e.tone === "warn" && "bg-amber-500",
              e.tone === "bad" && "bg-destructive",
              (!e.tone || e.tone === "neutral") && "bg-muted-foreground/60"
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-sm font-medium">{e.title}</div>
              <div className="text-muted-foreground shrink-0 text-xs">
                {formatDateTime(e.at)}
              </div>
            </div>
            {e.description ? (
              <div className="text-muted-foreground mt-1 text-sm">
                {e.bookingId ? (
                  <Link
                    href={`/admin/bookings/${e.bookingId}`}
                    className="hover:text-foreground underline underline-offset-4"
                  >
                    {e.description}
                  </Link>
                ) : (
                  e.description
                )}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
