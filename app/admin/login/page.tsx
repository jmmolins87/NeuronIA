"use client"

import Image from "next/image"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

import { UI_TEXT } from "@/app/admin/_ui-text"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="overflow-hidden">
          <div aria-hidden className="h-1 w-full bg-gradient-to-r from-gradient-from to-gradient-to" />
          <CardHeader className="items-center text-center">
            <div className="relative mb-2 size-14 overflow-hidden rounded-xl border bg-muted/10">
              <Image
                src="/logo.png"
                alt="ClinvetIA"
                fill
                sizes="56px"
                className="object-contain p-2"
                priority
              />
            </div>
            <CardTitle className="text-xl">{UI_TEXT.loginTitle}</CardTitle>
            <CardDescription>{UI_TEXT.loginSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                router.push("/admin")
              }}
            >
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Email (opcional)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@clinvetia.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-medium">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-neon-glow glow-sm gap-2">
                <Lock className="size-4" />
                {UI_TEXT.actions.signIn}
              </Button>

              <div className="text-muted-foreground text-xs">
                Sin autenticacion real. Al enviar, navega a <span className="font-medium">/admin</span>.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
