"use client"

import * as React from "react"
import Lenis from "lenis"

interface LenisContextValue {
  lenis: Lenis | null
  isEnabled: boolean
}

const LenisContext = React.createContext<LenisContextValue>({
  lenis: null,
  isEnabled: false,
})

export function useLenis() {
  return React.useContext(LenisContext)
}

interface LenisProviderProps {
  children: React.ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = React.useState<Lenis | null>(null)
  const [isEnabled, setIsEnabled] = React.useState(false)
  const rafId = React.useRef<number | null>(null)

  React.useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      setIsEnabled(false)
      return
    }

    // Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    setLenis(lenisInstance)
    setIsEnabled(true)

    // RAF loop
    function raf(time: number) {
      lenisInstance.raf(time)
      rafId.current = requestAnimationFrame(raf)
    }

    rafId.current = requestAnimationFrame(raf)

    // Cleanup
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
      lenisInstance.destroy()
    }
  }, [])

  React.useEffect(() => {
    function handleScrollLock(event: Event) {
      const custom = event as CustomEvent<{ locked?: boolean }>
      const locked = Boolean(custom.detail?.locked)
      if (!lenis) return

      if (locked) {
        lenis.stop()
      } else {
        lenis.start()
      }
    }

    window.addEventListener("clinvetia:scroll-lock", handleScrollLock as EventListener)
    return () => window.removeEventListener("clinvetia:scroll-lock", handleScrollLock as EventListener)
  }, [lenis])

  // Listen for reduced motion changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // Reduced motion enabled - disable Lenis
        setIsEnabled(false)
        if (lenis) {
          lenis.stop()
        }
      } else {
        // Reduced motion disabled - enable Lenis
        setIsEnabled(true)
        if (lenis) {
          lenis.start()
        }
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [lenis])

  return (
    <LenisContext.Provider value={{ lenis, isEnabled }}>
      {children}
    </LenisContext.Provider>
  )
}
