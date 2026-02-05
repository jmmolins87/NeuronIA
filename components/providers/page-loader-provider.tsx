"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Loader } from "@/components/loader"

export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = React.useState(true)
  const rafRef = React.useRef<number | null>(null)
  const timerRef = React.useRef<number | null>(null)

  const clearPending = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    clearPending()

    const MIN_MS = 600
    const MAX_HASH_WAIT_MS = 900
    const startedAt = performance.now()

    setIsLoading(true)

    const hash = window.location.hash
    const targetId = hash.startsWith("#") ? hash.slice(1) : ""

    const tryScrollToHash = () => {
      if (!targetId) return true

      const el = document.getElementById(targetId)
      if (!el) return false

      // Do not animate scroll while loader is visible
      el.scrollIntoView({ behavior: "auto", block: "start" })
      return true
    }

    const waitForHashThenHide = () => {
      const hashDone = tryScrollToHash()
      const elapsed = performance.now() - startedAt

      if (hashDone || elapsed >= MAX_HASH_WAIT_MS) {
        const remaining = Math.max(0, MIN_MS - elapsed)
        timerRef.current = window.setTimeout(() => {
          setIsLoading(false)
        }, remaining)
        return
      }

      rafRef.current = requestAnimationFrame(waitForHashThenHide)
    }

    rafRef.current = requestAnimationFrame(waitForHashThenHide)

    return () => {
      clearPending()
    }
  }, [pathname, clearPending])

  // Hide scrollbar when loader is visible
  React.useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isLoading])

  return (
    <>
      {isLoading && <Loader />}
      <div
        className={`transition-opacity duration-300 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"}`}
      >
        {children}
      </div>
    </>
  )
}
