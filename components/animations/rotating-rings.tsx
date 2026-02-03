"use client"

import * as React from "react"

interface RotatingRingsProps {
  count?: number
}

export function RotatingRings({ count = 6 }: RotatingRingsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {Array.from({ length: count }).map((_, i) => {
        const ringSize = 200 + i * 150
        const duration = 5 + i * 2
        const opacity = Math.max(0.1, 0.6 - i * 0.08)
        const direction = i % 2 === 0 ? "normal" : "reverse"
        const animationClass = `animate-[rotate_${duration}s_linear_infinite_${direction}]`

        return (
          <div
            key={i}
            className={`absolute rounded-full border-4 border-primary w-[${ringSize}px] h-[${ringSize}px] opacity-[${opacity.toFixed(2)}] shadow-[0_0_30px_oklch(var(--primary)/0.35),inset_0_0_30px_oklch(var(--primary)/0.35)] ${animationClass}`}
          >
            {Array.from({ length: 3 }).map((_, j) => {
              const topClass = j === 0 ? "top-0" : j === 1 ? "top-1/2" : "top-full"
              const dotDuration = 1 + j * 0.3
              const dotAnimationClass = `animate-[pulse_${dotDuration.toFixed(2)}s_ease-in-out_0s_infinite]`

              return (
                <div
                  key={j}
                  className={`absolute ${topClass} left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full shadow-[0_0_30px_oklch(var(--primary)/0.35)] ${dotAnimationClass}`}
                />
              )
            })}
          </div>
        )
      })}
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}
