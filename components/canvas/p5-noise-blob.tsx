"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface P5NoiseBlobProps {
  className?: string
}

export function P5NoiseBlob({ className }: P5NoiseBlobProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let p5Instance: any

    const initP5 = async () => {
      try {
        const p5 = (await import("p5")).default

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sketch = (p: any) => {
          let time = 0

          p.setup = () => {
            const canvas = p.createCanvas(
              containerRef.current?.clientWidth || 400,
              containerRef.current?.clientHeight || 400
            )
            canvas.parent(containerRef.current!)
            p.noFill()
          }

          p.draw = () => {
            p.clear()
            p.translate(p.width / 2, p.height / 2)

            // Draw multiple layers for more depth
            // Outer glow
            p.stroke(0, 255, 154, 30)
            p.strokeWeight(6)
            p.noFill()

            p.beginShape()
            for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
              const offset = p.map(
                p.noise(p.cos(angle) * 2 + time, p.sin(angle) * 2 + time),
                0,
                1,
                -50,
                50
              )
              const radius = 105 + offset
              const x = radius * p.cos(angle)
              const y = radius * p.sin(angle)
              p.vertex(x, y)
            }
            p.endShape(p.CLOSE)

            // Main blob
            p.stroke(0, 255, 154, 150)
            p.strokeWeight(2)

            p.beginShape()
            for (let angle = 0; angle < p.TWO_PI; angle += 0.1) {
              const offset = p.map(
                p.noise(p.cos(angle) * 2 + time, p.sin(angle) * 2 + time),
                0,
                1,
                -50,
                50
              )
              const radius = 100 + offset
              const x = radius * p.cos(angle)
              const y = radius * p.sin(angle)
              p.vertex(x, y)
            }
            p.endShape(p.CLOSE)

            time += 0.005
          }

          p.windowResized = () => {
            if (containerRef.current) {
              p.resizeCanvas(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
              )
            }
          }
        }

        p5Instance = new p5(sketch)
      } catch (error) {
        console.error("Failed to initialize P5.js:", error)
      }
    }

    initP5()

    return () => {
      if (p5Instance) {
        p5Instance.remove()
      }
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    // Static fallback
    return (
      <div
        className={cn(
          "absolute inset-0 pointer-events-none opacity-10 dark:opacity-5",
          className
        )}
        aria-hidden="true"
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary opacity-50"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 pointer-events-none opacity-30 dark:opacity-40",
        className
      )}
      aria-hidden="true"
    />
  )
}
