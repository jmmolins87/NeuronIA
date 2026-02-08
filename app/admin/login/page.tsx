"use client"

import Image from "next/image"
import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { UI_TEXT } from "@/app/admin/_ui-text"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RoiButton } from "@/components/cta/roi-button"
import { useTranslation } from "@/components/providers/i18n-provider"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<{ username?: string; password?: string }>({})
  const [touched, setTouched] = React.useState<{ username?: boolean; password?: boolean }>({})

  const redirectTo = searchParams.get("redirect") || "/admin"

  const validateField = (field: "username" | "password", value: string) => {
    if (!value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: field === "username" ? "usernameRequired" : "passwordRequired"
      }))
    } else {
      setFieldErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleBlur = (field: "username" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const value = field === "username" ? username : password
    validateField(field, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldErrors({})

    // Validate all fields
    if (!username.trim() || !password.trim()) {
      setIsLoading(false)
      if (!username.trim()) setFieldErrors((prev) => ({ ...prev, username: "usernameRequired" }))
      if (!password.trim()) setFieldErrors((prev) => ({ ...prev, password: "passwordRequired" }))
      setTouched({ username: true, password: true })
      return
    }

    try {
      // Demo mode check
      if (username === "demo" && password === "demo") {
        // Set demo session cookie
        document.cookie = "clinvetia_admin=demo-session; path=/; max-age=1800; SameSite=Lax"
        toast.success(t("admin.login.demoMode") || "Demo mode activated!")
        setTimeout(() => {
          router.push("/admin")
        }, 1000)
        return
      }

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "genericError")
        setIsLoading(false)
        return
      }

      toast.success("Login successful! Redirecting...")
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)

    } catch (err) {
      setError("networkError")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <div aria-hidden className="h-1 w-full bg-gradient-to-r from-gradient-from to-gradient-to" />
          <CardHeader className="items-center text-center pb-6">
            <div className="relative mx-auto mb-4 size-24 overflow-hidden bg-muted/10">
              <Image
                src="/logo.png"
                alt="ClinvetIA"
                fill
                sizes="96px"
                className="object-contain p-3"
                priority
              />
            </div>
            <CardTitle className="text-xl">{UI_TEXT.loginTitle}</CardTitle>
            <CardDescription>{UI_TEXT.loginSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-muted-foreground text-xs font-medium">
                  {t("admin.login.username") || "Username"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (touched.username) validateField("username", e.target.value)
                  }}
                  onBlur={() => handleBlur("username")}
                  placeholder={t("admin.login.usernamePlaceholder") || "Enter your username"}
                  autoComplete="username"
                  disabled={isLoading}
                  className={touched.username && fieldErrors.username ? "border-destructive" : ""}
                />
                {touched.username && fieldErrors.username && (
                  <p className="text-xs text-destructive mt-1">
                    {t(`admin.error.${fieldErrors.username}`)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-xs font-medium">
                  {t("admin.login.password") || "Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (touched.password) validateField("password", e.target.value)
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder={t("admin.login.passwordPlaceholder") || "Enter your password"}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={touched.password && fieldErrors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {t(`admin.error.${fieldErrors.password}`)}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  {t(`admin.error.${error}`) || t("admin.error.genericError") || error}
                </div>
              )}

              <div className="pt-2">
                <RoiButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  {isLoading 
                    ? (t("admin.login.signingIn") || "Signing in...")
                    : (t("admin.login.signIn") || UI_TEXT.actions.signIn)
                  }
                </RoiButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
