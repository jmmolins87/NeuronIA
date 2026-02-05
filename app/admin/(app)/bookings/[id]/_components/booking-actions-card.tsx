"use client"

import * as React from "react"
import { toast } from "sonner"
import { Copy, CalendarClock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/app/admin/_components/confirm-dialog"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function BookingActionsCard({ email, bookingId }: { email: string; bookingId: string }) {
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false)

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">{UI_TEXT.sections.quickActions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button variant="destructive" className="justify-start gap-2" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-4" />
              {UI_TEXT.actions.cancel}
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => setRescheduleOpen(true)}>
              <CalendarClock className="size-4" />
              {UI_TEXT.actions.reschedule}
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(email)
                  toast.success("Email copiado (mock)")
                } catch {
                  toast.error("No se pudo copiar (mock)")
                }
              }}
            >
              <Copy className="size-4" />
              {UI_TEXT.actions.copyEmail}
            </Button>
          </div>
          <div className="text-muted-foreground mt-3 text-xs">
            Acciones solo UI: no cambian el estado real.
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={UI_TEXT.dialogs.cancelTitle}
        description={`${bookingId} • ${email}`}
        confirmLabel={UI_TEXT.actions.cancel}
        onConfirm={() => toast.error("Cancelada (mock)")}
      />

      <ConfirmDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        title={UI_TEXT.dialogs.rescheduleTitle}
        description={`${bookingId} • ${email}`}
        confirmLabel={UI_TEXT.actions.reschedule}
        onConfirm={() => toast.message("Reagendada (mock)")}
      />
    </>
  )
}
