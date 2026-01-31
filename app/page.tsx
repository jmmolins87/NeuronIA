import { SiteShell } from "@/components/site-shell"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <SiteShell>
      <section className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-screen-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-4xl space-y-8">
          {/* Logo grande */}
          <div className="flex justify-center">
            <Logo 
              width={800} 
              height={200} 
              className="h-32 w-auto sm:h-40 md:h-48 lg:h-56 xl:h-64" 
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Automatización Inteligente con{" "}
            <span className="text-primary dark:text-glow-primary">IA</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Transforma tu negocio con soluciones de inteligencia artificial
            personalizadas. Optimiza procesos, reduce costos y maximiza
            resultados.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/reservar">Reservar Demo Gratuita</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/roi">Calcular ROI</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
