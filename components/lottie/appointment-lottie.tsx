"use client"

import * as React from "react"
import Lottie from "lottie-react"
import { Calendar } from "lucide-react"

import appointmentAnimation from "@/components/lottie/appointment.json"
import { useTranslation } from "@/components/providers/i18n-provider"
import { cn } from "@/lib/utils"

interface AppointmentLottieProps extends React.ComponentProps<"div"> {
  size?: "sm" | "md" | "lg"
}

const SIZE_STYLES: Record<NonNullable<AppointmentLottieProps["size"]>, string> = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
}

function AppointmentLottie({ className, size = "md", ...props }: AppointmentLottieProps) {
  const { t } = useTranslation()
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  if (prefersReducedMotion) {
    return (
      <div
        {...props}
        role="img"
        aria-label={t("lottie.appointmentLabel")}
        className={cn(
          "flex items-center justify-center rounded-full bg-muted/60 text-primary",
          SIZE_STYLES[size],
          className
        )}
      >
        <Calendar className="size-5" aria-hidden />
      </div>
    )
  }

  return (
    <div
      {...props}
      role="img"
      aria-label={t("lottie.appointmentLabel")}
      className={cn("flex items-center justify-center", SIZE_STYLES[size], className)}
    >
      <Lottie
        animationData={appointmentAnimation}
        autoplay
        loop
        className="size-full"
      />
    </div>
  )
}

export { AppointmentLottie }
