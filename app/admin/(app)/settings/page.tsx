"use client"

import * as React from "react"
import { Bell, Paintbrush, Shield } from "lucide-react"

import { UI_TEXT } from "@/app/admin/_ui-text"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

function SettingRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/10 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md border bg-background/60 p-2 text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{title}</div>
            <Badge variant="outline">Mock</Badge>
          </div>
          <div className="text-muted-foreground mt-1 text-sm">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function AdminSettingsPage() {
  const [notifications, setNotifications] = React.useState(true)
  const [defaultTheme, setDefaultTheme] = React.useState(false)
  const [securityMode, setSecurityMode] = React.useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{UI_TEXT.settingsTitle}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{UI_TEXT.settingsSubtitle}</p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">{UI_TEXT.sections.comingSoon}</CardTitle>
          <CardDescription>
            Pantalla placeholder con toggles UI (sin persistencia).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <SettingRow
              icon={<Bell className="size-4" />}
              title="Notificaciones"
              description="Avisos de nuevas reservas, cancelaciones, no-shows."
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <SettingRow
              icon={<Paintbrush className="size-4" />}
              title="Tema por defecto"
              description="Elegir light/dark como preferencia inicial (mock)."
              checked={defaultTheme}
              onCheckedChange={setDefaultTheme}
            />
            <SettingRow
              icon={<Shield className="size-4" />}
              title="Modo estricto"
              description="Requiere confirmacion adicional en acciones destructivas (mock)."
              checked={securityMode}
              onCheckedChange={setSecurityMode}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Integraciones</CardTitle>
            <CardDescription>Calendly, CRM, WhatsApp, email provider.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            UI placeholder.
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Roles y permisos</CardTitle>
            <CardDescription>Gestion de usuarios del admin.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            UI placeholder.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
