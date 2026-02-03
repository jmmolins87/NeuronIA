"use client"

import * as React from "react"

export function SpiralDots() {
  const spirals = 3
  const dotsPerSpiral = 40

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {Array.from({ length: spirals }).map((_, spiralIndex) => (
        <React.Fragment key={spiralIndex}>
          {Array.from({ length: dotsPerSpiral }).map((_, i) => (
            <div
              key={`${spiralIndex}-${i}`}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_oklch(var(--primary)/0.35)] ${
                i % 3 === 0 ? "blur-0" : i % 3 === 1 ? "blur-[1px]" : "blur-sm"
              } animate-[spiral_${(12 - spiralIndex * 2).toFixed(2)}s_linear_${(
                i * 0.08 + spiralIndex * 0.5
              ).toFixed(2)}s_infinite]`}
            />
          ))}
        </React.Fragment>
      ))}
      <style jsx>{`
        @keyframes spiral {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(50px) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(1080deg) translateX(500px) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
