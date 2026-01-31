import { SiteShell } from "@/components/site-shell"

export default function ComoFuncionaPage() {
  return (
    <SiteShell>
      <section className="container mx-auto max-w-screen-2xl px-4 py-16">
        <div className="max-w-4xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Cómo Funciona
          </h1>
          <p className="text-lg text-muted-foreground">
            Conoce nuestro proceso de implementación paso a paso. Contenido
            próximamente en Phase 2.
          </p>
        </div>
      </section>
    </SiteShell>
  )
}
