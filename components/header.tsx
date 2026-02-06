"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { DemoButton } from "@/components/cta/demo-button"
import { RoiButton } from "@/components/cta/roi-button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Header() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === "/"
  const [showHeaderLogo, setShowHeaderLogo] = React.useState(false)

  const handleMobileLogoClick = React.useCallback(() => {
    setIsOpen(false)

    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    router.push("/")
  }, [pathname, router])

  const navRef = React.useRef<HTMLElement | null>(null)
  const linkRefs = React.useRef<Record<string, HTMLAnchorElement | null>>({})
  const [indicator, setIndicator] = React.useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const navLinks = React.useMemo(
    () => [
      { href: "/solucion", label: t("nav.solution") },
      { href: "/escenarios", label: t("nav.scenarios") },
      { href: "/como-funciona", label: t("nav.howItWorks") },
      { href: "/contacto", label: t("nav.contact") },
    ],
    [t]
  )

  const activeHref = React.useMemo(() => {
    const activeLink = navLinks.find((l) => l.href === pathname)
    return activeLink?.href ?? null
  }, [navLinks, pathname])

  const setIndicatorToHref = React.useCallback((href: string) => {
    const navEl = navRef.current
    const linkEl = linkRefs.current[href]

    if (!navEl || !linkEl) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const navRect = navEl.getBoundingClientRect()
    const linkRect = linkEl.getBoundingClientRect()
    const left = linkRect.left - navRect.left
    const width = linkRect.width

    setIndicator({ left, width, opacity: 1 })
  }, [])

  React.useLayoutEffect(() => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    setIndicatorToHref(activeHref)
  }, [activeHref, setIndicatorToHref])

  React.useEffect(() => {
    if (!activeHref) return

    const handleResize = () => setIndicatorToHref(activeHref)
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [activeHref, setIndicatorToHref])

  const handleNavMouseLeave = () => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    setIndicatorToHref(activeHref)
  }

  const handleNavBlurCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (!activeHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const next = event.relatedTarget as Node | null
    if (next && navRef.current?.contains(next)) return
    setIndicatorToHref(activeHref)
  }

  const indicatorStyle: React.CSSProperties = {
    left: 0,
    width: indicator.width,
    opacity: indicator.opacity,
    transform: `translateX(${indicator.left}px)`,
  }

  // Detectar cuando el logo del hero sale del viewport
  React.useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      // Detectar si hemos scrolleado más allá del hero logo
      // El logo del hero está aproximadamente a 200-400px del top
      const scrollThreshold = 300
      setShowHeaderLogo(window.scrollY > scrollThreshold)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo - Lógica de visibilidad */}
        {isHomePage ? (
          // En homepage: mobile siempre visible, desktop solo cuando scroll > threshold
          <>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center cursor-pointer md:hidden"
              aria-label={t("aria.goToTop")}
            >
              <Logo width={200} height={50} className="h-12 w-auto" />
            </button>
            {showHeaderLogo && (
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden md:flex items-center cursor-pointer"
                aria-label={t("aria.goToTop")}
              >
                <Logo width={200} height={50} className="h-14 w-auto" />
              </button>
            )}
          </>
        ) : (
          // En otras páginas: siempre visible
          <Link href="/" className="flex items-center cursor-pointer">
            <Logo width={200} height={50} className="h-12 w-auto md:h-14" />
          </Link>
        )}

        {/* Contenedor derecho - siempre alineado a la derecha */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Desktop Navigation */}
          <nav
            ref={navRef}
            className="hidden relative items-center gap-6 md:flex"
            onMouseLeave={handleNavMouseLeave}
            onBlurCapture={handleNavBlurCapture}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-gradient-from to-gradient-to dark:from-primary dark:to-primary transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={indicatorStyle}
            />
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    linkRefs.current[link.href] = el
                  }}
                  onMouseEnter={() => setIndicatorToHref(link.href)}
                  onFocus={() => setIndicatorToHref(link.href)}
                  className={`relative z-10 py-1 text-sm font-medium transition-colors hover:text-gradient-to dark:hover:text-primary focus-visible:outline-none ${
                    isActive ? "text-gradient-to dark:text-primary" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions - Desktop only shows Language/Theme, Mobile hides them */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            
            <DemoButton asChild size="sm" className="hidden md:inline-flex">
              <Link href="/reservar">{t("common.bookDemo")}</Link>
            </DemoButton>
            
            <RoiButton asChild size="sm" className="hidden md:inline-flex">
              <Link href="/roi">{t("nav.roi")}</Link>
            </RoiButton>
          </div>

          {/* Mobile: Menu button - Al final de todo */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("aria.openMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" showCloseButton={false} className="w-full h-screen p-0 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden">
              <div className="flex-1 flex flex-col justify-center p-6">
                <SheetHeader className="mb-6 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleMobileLogoClick}
                    className="inline-flex cursor-pointer"
                    aria-label={t("aria.goToTop")}
                  >
                    <Logo width={220} height={55} className="h-14 w-auto" />
                  </button>
                </SheetHeader>
                <nav className="flex flex-col items-center gap-5">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-xl font-medium transition-colors text-center ${
                          isActive
                            ? "text-gradient-to dark:text-primary"
                            : "text-foreground hover:text-gradient-to dark:hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                  
                  {/* Language and Theme switches - Centered with screen, one below the other */}
                  <div className="mx-auto mt-4 relative left-1/2 -translate-x-1/2 w-screen flex flex-col items-center justify-center gap-3">
                    <LanguageSwitcher />
                    <ThemeToggle size="large" />
                  </div>

                  <div className="mt-3 flex flex-col gap-3 w-full max-w-sm">
                    <DemoButton asChild size="default" className="w-full">
                      <Link href="/reservar" onClick={() => setIsOpen(false)}>
                        {t("common.bookDemo")}
                      </Link>
                    </DemoButton>
                    <RoiButton asChild size="default" className="w-full">
                      <Link href="/roi" onClick={() => setIsOpen(false)}>
                        {t("nav.roi")}
                      </Link>
                    </RoiButton>
                  </div>
                </nav>
              </div>
              
              {/* Close button at bottom */}
              <div className="p-6 border-t border-border/50 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setIsOpen(false)}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 text-lg font-medium hover:bg-primary/10"
                  aria-label={t("aria.closeMenu")}
                >
                  <X className="h-6 w-6" />
                  {t("common.close")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
