"use client"

import * as React from "react"
import anime from "animejs"

import { cn } from "@/lib/utils"

interface AnimeSparksProps extends React.ComponentProps<"div"> {
  density?: "low" | "medium"
}

const densityClasses: Record<NonNullable<AnimeSparksProps["density"]>, string> = {
  low: "opacity-40",
  medium: "opacity-60",
}

function AnimeSparks({ className, density = "medium", ...props }: AnimeSparksProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion || !containerRef.current) return

    const targets = containerRef.current.querySelectorAll("[data-spark]")

    const animation = anime({
      targets,
      translateY: [0, -12],
      translateX: [0, 12],
      opacity: [0.35, 0.9],
      scale: [0.9, 1.2],
      easing: "easeInOutSine",
      duration: 3200,
      delay: anime.stagger(180),
      direction: "alternate",
      loop: true,
    })

    return () => animation.pause()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 motion-reduce:hidden",
        densityClasses[density],
        className
      )}
      aria-hidden="true"
      {...props}
    >
      <span
        data-spark
        className="absolute left-[12%] top-[22%] size-2 rounded-full bg-primary/40 blur-[1px]"
      />
      <span
        data-spark
        className="absolute left-[28%] top-[68%] size-3 rounded-full bg-accent/40 blur-[1px]"
      />
      <span
        data-spark
        className="absolute right-[18%] top-[30%] size-2 rounded-full bg-gradient-to/40 blur-[1px]"
      />
      <span
        data-spark
        className="absolute right-[24%] bottom-[18%] size-3 rounded-full bg-primary/40 blur-[1px]"
      />
      <span
        data-spark
        className="absolute left-[50%] bottom-[22%] size-2 rounded-full bg-accent/40 blur-[1px]"
      />
      <span
        data-spark
        className="absolute left-[72%] top-[55%] size-2 rounded-full bg-gradient-to/40 blur-[1px]"
      />
    </div>
  )
}

export { AnimeSparks }
