"use client"

import * as React from "react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function InternalNotesCard({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue)

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">{UI_TEXT.sections.internalNotes}</CardTitle>
        <CardDescription>Solo UI: no se guarda en backend.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe una nota para el equipo..."
            className="min-h-28"
            aria-label={UI_TEXT.sections.internalNotes}
          />
          <div className="flex items-center justify-end">
            <Button
              className="bg-gradient-neon-glow glow-sm"
              onClick={() => toast.success("Guardado (mock)")}
            >
              {UI_TEXT.actions.save}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
