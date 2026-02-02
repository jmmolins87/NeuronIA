"use client"

import * as React from "react"
import { useStagger } from "@/hooks/use-stagger"
import { HelpCircle, ChevronDown } from "lucide-react"
import { useTranslation } from "@/components/providers/i18n-provider"

export function HowFaq() {
  const { t } = useTranslation()
  const { ref: staggerRef } = useStagger({
    stagger: 100,
    duration: 600,
    distance: 30,
  })
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const faqs = [
    {
      q: t("howItWorks.faq.items.0.q"),
      a: t("howItWorks.faq.items.0.a"),
    },
    {
      q: t("howItWorks.faq.items.1.q"),
      a: t("howItWorks.faq.items.1.a"),
    },
    {
      q: t("howItWorks.faq.items.2.q"),
      a: t("howItWorks.faq.items.2.a"),
    },
    {
      q: t("howItWorks.faq.items.3.q"),
      a: t("howItWorks.faq.items.3.a"),
    },
    {
      q: t("howItWorks.faq.items.4.q"),
      a: t("howItWorks.faq.items.4.a"),
    },
    {
      q: t("howItWorks.faq.items.5.q"),
      a: t("howItWorks.faq.items.5.a"),
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div
      ref={staggerRef as React.RefObject<HTMLDivElement>}
      className="max-w-3xl mx-auto space-y-4"
    >
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            data-stagger-item
            className={`rounded-xl border-2 bg-card/80 backdrop-blur-sm transition-all duration-300 ${
              isOpen
                ? "border-primary shadow-xl dark:shadow-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left px-6 py-6 flex items-center gap-4 transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-sm flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-white dark:text-black" />
              </div>
              <span className="flex-1 text-base font-semibold text-foreground sm:text-lg leading-tight">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pl-18">
                <p className="text-base text-foreground/80 dark:text-foreground/90 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
