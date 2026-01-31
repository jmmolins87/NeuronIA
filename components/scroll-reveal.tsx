"use client"

import * as React from "react"
import { useInView } from "react-intersection-observer"

import { cn } from "@/lib/utils"

interface ScrollRevealProps extends React.ComponentProps<"div"> {
  delay?: 0 | 100 | 200 | 300 | 400
  once?: boolean
}

const DELAY_CLASS: Record<NonNullable<ScrollRevealProps["delay"]>, string> = {
  0: "delay-0",
  100: "delay-100",
  200: "delay-200",
  300: "delay-300",
  400: "delay-400",
}

function ScrollReveal({
  className,
  delay = 0,
  once = true,
  ...props
}: ScrollRevealProps) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: once })

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        DELAY_CLASS[delay],
        inView
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0",
        className
      )}
      {...props}
    />
  )
}

export { ScrollReveal }
