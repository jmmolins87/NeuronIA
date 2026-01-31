import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const footerLinks = {
  product: [
    { href: "/solucion", label: "Solución" },
    { href: "/roi", label: "Calculadora ROI" },
    { href: "/escenarios", label: "Casos de Uso" },
    { href: "/como-funciona", label: "Cómo Funciona" },
  ],
  company: [
    { href: "/metodologia", label: "Metodología" },
    { href: "/faqs", label: "Preguntas Frecuentes" },
    { href: "/contacto", label: "Contacto" },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto max-w-screen-2xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo width={200} height={50} className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Automatización inteligente impulsada por IA para transformar tu negocio.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Producto</h3>
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
            <h3 className="text-sm font-semibold">Empresa</h3>
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
            <h3 className="text-sm font-semibold">Comienza Hoy</h3>
            <p className="text-sm text-muted-foreground">
              Reserva una demo personalizada y descubre el potencial de la IA.
            </p>
            <Button asChild size="sm">
              <Link href="/reservar">Reservar Demo</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} NeuronIA. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidad"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
