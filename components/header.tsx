"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
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

const navLinks = [
  { href: "/solucion", label: "Solución" },
  { href: "/roi", label: "ROI" },
  { href: "/escenarios", label: "Escenarios" },
  { href: "/como-funciona", label: "Cómo Funciona" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/faqs", label: "FAQs" },
]

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-end px-4">
        {/* Mobile: Menu button on left */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-auto md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href="/reservar" onClick={() => setIsOpen(false)}>
                  Reservar Demo
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation - Always on right */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:ml-6">
          <LanguageSwitcher />
          <ThemeToggle />
          
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/reservar">Reservar Demo</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
