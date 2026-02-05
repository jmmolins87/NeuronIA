import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UI_TEXT } from "@/app/admin/_ui-text"

export function EmptyState({
  title = UI_TEXT.empty.title,
  description = UI_TEXT.empty.description,
  onAction,
}: {
  title?: string
  description?: string
  onAction?: () => void
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="bg-gradient-neon-glow text-primary-foreground glow-sm"
          onClick={onAction}
        >
          {UI_TEXT.actions.createFirst}
        </Button>
      </CardContent>
    </Card>
  )
}
