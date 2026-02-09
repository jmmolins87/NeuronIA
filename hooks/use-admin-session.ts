"use client"

import { useState, useEffect } from "react"
import { adminApi, type AdminSession, type AdminUser } from "@/lib/admin-api"

/**
 * Hook to manage admin session + CSRF token
 * 
 * Usage:
 * ```tsx
 * const { user, isLoading, isDemoMode, logout } = useAdminSession()
 * 
 * if (isLoading) return <Spinner />
 * if (!user) return <LoginPrompt />
 * 
 * return <Dashboard user={user} isDemoMode={isDemoMode} />
 * ```
 */
export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      try {
        setIsLoading(true)
        setError(null)

        const sessionData = await adminApi.init()

        if (mounted) {
          if (sessionData) {
            setSession(sessionData)
          } else {
            setSession(null)
            setError("Not authenticated")
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load session")
          setSession(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      mounted = false
    }
  }, [])

  const logout = async () => {
    await adminApi.logout()
    setSession(null)
    window.location.href = "/admin/login"
  }

  return {
    user: session?.user ?? null,
    csrfToken: session?.csrfToken ?? null,
    isLoading,
    error,
    isDemoMode: session?.user?.mode === "DEMO",
    isAuthenticated: !!session,
    logout,
  }
}

/**
 * Hook to check if user has SUPER_ADMIN role
 */
export function useIsSuperAdmin(): boolean {
  const { user } = useAdminSession()
  return user?.role === "SUPER_ADMIN"
}

/**
 * Hook to get current user safely
 */
export function useAdminUser(): AdminUser | null {
  const { user } = useAdminSession()
  return user
}
