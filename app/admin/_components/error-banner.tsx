import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function ErrorBanner({
  title = UI_TEXT.error.title,
  description = UI_TEXT.error.description,
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <div className="flex items-start gap-3 px-6 py-5">
        <div className="mt-0.5 rounded-md bg-destructive/10 p-2 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-muted-foreground mt-1 text-sm">{description}</div>
        </div>
        <Button variant="outline" onClick={onRetry}>
          {UI_TEXT.actions.retry}
        </Button>
      </div>
    </Card>
  )
}
