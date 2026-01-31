import { SiteShell } from "@/components/site-shell"

export default function ReservarPage() {
  return (
    <SiteShell>
      <section className="container mx-auto max-w-screen-2xl px-4 py-16">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Reservar Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Agenda una demostración personalizada de nuestras soluciones de IA.
            Formulario de reserva próximamente en Phase 2.
          </p>
        </div>
      </section>
    </SiteShell>
  )
}
