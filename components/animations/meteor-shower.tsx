"use client"

import * as React from "react"

export function MeteorShower() {
  const meteors = 25

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: meteors }).map((_, i) => {
        const widthPx = 2 + (i % 2)
        const heightPx = 60 + (i % 5) * 20
        const left = ((i * 19) % 120) - 10
        const duration = 2.6 + (i % 7) * 0.42
        const delay = (i % 10) * 0.5

        const animationClass = `animate-[meteor_${duration.toFixed(2)}s_linear_${delay.toFixed(2)}s_infinite]`

        return (
          <div
            key={i}
            className={`absolute top-[-150px] rotate-45 opacity-40 blur-[1px] left-[${left}%] w-[${widthPx}px] h-[${heightPx}px] bg-gradient-to-b from-primary via-primary to-transparent shadow-[0_0_18px_oklch(var(--primary)/0.35)] ${animationClass}`}
          />
        )
      })}
      <style jsx>{`
        @keyframes meteor {
          0% {
            transform: translateY(0) translateX(0) rotate(45deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(50px) translateX(50px) rotate(45deg) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) translateX(120vh) rotate(45deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
