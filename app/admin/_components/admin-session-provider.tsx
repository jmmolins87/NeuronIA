"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes
const WARNING_TIMEOUT = 4 * 60 * 1000 // 4 minutes (1 minute warning)

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Don't apply session timeout on login page
  const isActive = !pathname?.includes("/admin/login")
  
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const warningRef = React.useRef<NodeJS.Timeout>()

  const resetTimeout = React.useCallback(() => {
    if (!isActive) return
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    
    // Show warning at 4 minutes
    warningRef.current = setTimeout(() => {
      toast.warning("Tu sesión expirará en 1 minuto por inactividad", {
        duration: 5000,
      })
    }, WARNING_TIMEOUT)
    
    // Logout at 5 minutes
    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" })
        toast.error("Sesión expirada por inactividad")
        router.push("/admin/login")
      } catch (error) {
        toast.error("Error al cerrar sesión")
        router.push("/admin/login")
      }
    }, INACTIVITY_TIMEOUT)
  }, [isActive, router])

  // Reset timeout on user activity
  React.useEffect(() => {
    if (!isActive) return

    const handleActivity = () => resetTimeout()
    
    const events = [
      "mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"
    ]
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })
    
    resetTimeout()
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [isActive, resetTimeout])

  // Handle window close/blur
  React.useEffect(() => {
    if (!isActive) return

    const handleBeforeUnload = async () => {
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" })
      } catch (error) {
        // Ignore errors during unload
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleBeforeUnload()
      } else if (document.visibilityState === "visible") {
        // Check if session is still valid when tab becomes visible
        fetch("/api/admin/auth/me")
          .then(response => {
            if (!response.ok) {
              toast.error("Sesión expirada")
              router.push("/admin/login")
            }
          })
          .catch(() => {
            // Ignore network errors
          })
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("visibilitychange", handleVisibilityChange)
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isActive, router])

  return <>{children}</>
}