"use client"

import * as React from "react"
import { useTranslation } from "@/components/providers/i18n-provider"

interface Section {
  id: string
  label: string
}

const SECTIONS: Section[] = [
  { id: "hero", label: "nav.home" },
  { id: "problem-section", label: "nav.problem" },
  { id: "system-section", label: "nav.solution" },
  { id: "flow-section", label: "nav.flow" },
  { id: "benefits-section", label: "nav.benefits" },
  { id: "scenarios-section", label: "nav.scenarios" },
  { id: "roi-section", label: "nav.roi" },
  { id: "final-cta-section", label: "nav.contact" },
]

export function ActiveSectionIndicator() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = React.useState<string>("hero")

  React.useEffect(() => {
    const handleScroll = () => {
      // Usar scroll + 200px como punto de referencia (debajo del header)
      const scrollPos = window.scrollY + 200

      let newActiveSection = "hero"

      // Buscar qué sección está en esa posición
      SECTIONS.forEach((section) => {
        const element = document.getElementById(section.id)
        if (!element) return

        const offsetTop = element.offsetTop
        const offsetHeight = element.offsetHeight

        // Si la posición de scroll está dentro de esta sección
        if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
          newActiveSection = section.id
        }
      })

      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection)
      }
    }

    // Ejecutar al montar y en cada scroll
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [activeSection])

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Solo aplicar offset del header para la sección hero
      const headerHeight = sectionId === "hero" ? 64 : 0 // 4rem = 64px
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  return (
    <nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
      aria-label={t("aria.sectionNavigation")}
    >
      <ul className="flex flex-col gap-3">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => handleClick(section.id)}
              className={`group relative block transition-all duration-300 cursor-pointer ${
                activeSection === section.id
                  ? "scale-110"
                  : "scale-100 hover:scale-110"
              }`}
              aria-label={t(section.label)}
              aria-current={activeSection === section.id ? "location" : undefined}
            >
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to border-gradient-to shadow-lg shadow-gradient-to/50 dark:bg-primary dark:border-primary dark:shadow-primary/50 dark:glow-primary"
                    : "bg-transparent border-muted-foreground/30 hover:border-gradient-to/50 dark:hover:border-primary/50"
                }`}
              />
              {/* Label on hover */}
              <span
                className={`absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium bg-card border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                  activeSection === section.id ? "text-gradient-to dark:text-primary" : "text-foreground"
                }`}
              >
                {t(section.label)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
