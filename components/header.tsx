"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Header() {
  const { t, locale } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const navRef = React.useRef<HTMLElement>(null)
  const [showHeaderLogo, setShowHeaderLogo] = React.useState(false)
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const navLinks = [
    { href: "/solucion", label: t("nav.solution") },
    { href: "/roi", label: t("nav.roi") },
    { href: "/escenarios", label: t("nav.scenarios") },
    { href: "/como-funciona", label: t("nav.howItWorks") },
    { href: "/metodologia", label: t("nav.methodology") },
    { href: "/faqs", label: t("nav.faqs") },
  ]

  // Actualizar posición del underline cuando cambia la ruta o el idioma
  React.useEffect(() => {
    const updateIndicator = (targetElement?: HTMLElement) => {
      if (!navRef.current) return

      const activeLink = targetElement || navRef.current.querySelector(
        `a[href="${pathname}"]`
      ) as HTMLElement

      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect()
        const linkRect = activeLink.getBoundingClientRect()
        const newLeft = linkRect.left - navRect.left
        const newWidth = linkRect.width

        setIndicatorStyle({
          left: newLeft,
          width: newWidth,
          opacity: 1,
        })
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      }
    }

    // Pequeño delay para permitir que el DOM se actualice
    const timer = setTimeout(() => updateIndicator(), 50)
    
    window.addEventListener("resize", () => updateIndicator())
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", () => updateIndicator())
    }
  }, [pathname, locale])

  // Manejar hover sobre links
  const handleLinkHover = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return
    const navRect = navRef.current.getBoundingClientRect()
    const linkRect = event.currentTarget.getBoundingClientRect()
    const newLeft = linkRect.left - navRect.left
    const newWidth = linkRect.width

    setIndicatorStyle({
      left: newLeft,
      width: newWidth,
      opacity: 1,
    })
  }

  // Volver al link activo cuando sale el hover
  const handleNavLeave = () => {
    if (!navRef.current) return
    const activeLink = navRef.current.querySelector(
      `a[href="${pathname}"]`
    ) as HTMLElement

    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const newLeft = linkRect.left - navRect.left
      const newWidth = linkRect.width

      setIndicatorStyle({
        left: newLeft,
        width: newWidth,
        opacity: 1,
      })
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
    }
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
          {/* Mobile: Menu button */}
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>{t("common.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-medium transition-colors ${
                        isActive
                          ? "text-gradient-to dark:text-primary"
                          : "text-foreground hover:text-gradient-to dark:hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href="/reservar" onClick={() => setIsOpen(false)}>
                    {t("common.bookDemo")}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav 
            ref={navRef} 
            className="hidden relative items-center gap-6 md:flex"
            onMouseLeave={handleNavLeave}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={handleLinkHover}
                className="text-sm font-medium text-foreground transition-colors hover:text-gradient-to dark:hover:text-primary py-1"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Animated underline indicator */}
            <span
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-gradient-from to-gradient-to transition-all duration-300 ease-in-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/reservar">{t("common.bookDemo")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
