"use client"

import * as React from "react"

export function PulsingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,oklch(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--primary))_1px,transparent_1px)] [background-size:50px_50px] animate-[gridPulse_3s_ease-in-out_infinite]"
      />
      <div
        className="absolute inset-0 opacity-15 [background-image:linear-gradient(45deg,oklch(var(--primary))_1px,transparent_1px),linear-gradient(-45deg,oklch(var(--primary))_1px,transparent_1px)] [background-size:50px_50px] animate-[gridPulse_3s_ease-in-out_infinite_reverse]"
      />
      {Array.from({ length: 10 }).map((_, i) => {
        const left = (i * 31) % 100
        const top = (i * 47) % 100
        const duration = 1.2 + (i % 5) * 0.35
        const delay = (i % 6) * 0.25
        const animationClass = `animate-[gridPulse_${duration.toFixed(2)}s_ease-in-out_${delay.toFixed(2)}s_infinite]`

        return (
          <div
            key={i}
            className={`absolute left-[${left}%] top-[${top}%] w-2 h-2 bg-primary rounded-full shadow-[0_0_20px_oklch(var(--primary)/0.35)] ${animationClass}`}
          />
        )
      })}
      <style jsx>{`
        @keyframes gridPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
