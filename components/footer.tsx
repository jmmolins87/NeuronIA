"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Calculator } from "lucide-react"
import { DemoButton } from "@/components/cta/demo-button"
import { RoiButton } from "@/components/cta/roi-button"
import { BookingModal } from "@/components/booking-modal"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useTranslation } from "@/components/providers/i18n-provider"

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const [showBookingModal, setShowBookingModal] = React.useState(false)

  const footerLinks = {
    product: [
      { href: "/solucion", label: t("footer.links.solution") },
      { href: "/escenarios", label: t("footer.links.useCases") },
      { href: "/roi", label: t("footer.links.roiCalculator") },
      { href: "/como-funciona", label: t("footer.links.howItWorks") },
    ],
    company: [
      { href: "/faqs", label: t("footer.links.faqs") },
      { href: "/contacto", label: t("footer.links.contact") },
    ],
  }

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-block cursor-pointer"
              aria-label={t("aria.goToTop")}
            >
              <Logo width={200} height={50} className="h-14 w-auto" />
            </button>
            <p className="text-sm text-muted-foreground">
              {t("footer.brand.description")}
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.sections.product")}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.sections.company")}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.sections.getStarted")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <DemoButton onClick={() => setShowBookingModal(true)} size="sm">
                <Calendar className="w-4 h-4" />
                {t("common.bookDemo")}
              </DemoButton>
              <RoiButton asChild size="sm">
                <Link href="/roi">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    {t("nav.roi")}
                  </span>
                </Link>
              </RoiButton>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: currentYear.toString() })}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.links.privacy")}
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.links.terms")}
            </Link>
          </div>
        </div>
      </div>

      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        onBookingComplete={() => setShowBookingModal(false)}
      />
    </footer>
  )
}
