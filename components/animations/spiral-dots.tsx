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
              className="absolute w-4 h-4 bg-primary rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%)`,
                animation: `spiral ${12 - spiralIndex * 2}s linear infinite`,
                animationDelay: `${i * 0.08 + spiralIndex * 0.5}s`,
                filter: `blur(${Math.random() * 2}px)`,
                boxShadow: '0 0 20px var(--primary)'
              }}
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
