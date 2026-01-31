import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

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
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/neuroxia-logo.svg"
                alt="NeuronIA Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">NeuronIA</span>
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
            <Link
              href="/reservar"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Reservar Demo
            </Link>
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
