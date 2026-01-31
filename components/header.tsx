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
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const navRef = React.useRef<HTMLElement>(null)
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

  const updateIndicator = React.useCallback((element?: HTMLElement | null) => {
    if (!navRef.current || !element) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }))
      return
    }

    const navRect = navRef.current.getBoundingClientRect()
    const linkRect = element.getBoundingClientRect()

    setIndicatorStyle({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      opacity: 1,
    })
  }, [])

  React.useEffect(() => {
    if (!navRef.current) return
    const activeLink = navRef.current.querySelector(
      `a[href="${pathname}"]`
    ) as HTMLElement | null

    updateIndicator(activeLink)

    const observer = new ResizeObserver(() => {
      const currentActive = navRef.current?.querySelector(
        `a[href="${pathname}"]`
      ) as HTMLElement | null
      updateIndicator(currentActive)
    })

    observer.observe(navRef.current)
    window.addEventListener("resize", () => updateIndicator(activeLink))

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", () => updateIndicator(activeLink))
    }
  }, [pathname, navLinks.length, updateIndicator])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link
          href="/"
          className={`flex items-center ${isHomePage ? "md:hidden" : ""}`}
        >
          <Logo width={200} height={50} className="h-10 w-auto md:h-12" />
        </Link>

        {/* Contenedor derecho - siempre alineado a la derecha */}
        <div className="ml-auto flex items-center gap-6">
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
            className="relative hidden items-center gap-6 md:flex"
            onMouseLeave={() => {
              const activeLink = navRef.current?.querySelector(
                `a[href="${pathname}"]`
              ) as HTMLElement | null
              updateIndicator(activeLink)
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={(event) => updateIndicator(event.currentTarget)}
                  onFocus={(event) => updateIndicator(event.currentTarget)}
                  className={`relative text-sm font-medium text-foreground transition-colors hover:text-gradient-to dark:hover:text-primary py-1 ${
                    isActive ? "text-gradient-to dark:text-primary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            <span
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-gradient-from to-gradient-to transition-all duration-300 ease-out"
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
