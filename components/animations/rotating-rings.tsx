"use client"

import * as React from "react"

interface RotatingRingsProps {
  count?: number
}

export function RotatingRings({ count = 6 }: RotatingRingsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-4 border-primary"
          style={{
            width: `${200 + i * 150}px`,
            height: `${200 + i * 150}px`,
            animation: `rotate ${5 + i * 2}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
            opacity: 0.6 - i * 0.08,
            boxShadow: `0 0 30px var(--primary), inset 0 0 30px var(--primary)`
          }}
        >
          {Array.from({ length: 3 }).map((_, j) => (
            <div 
              key={j}
              className="absolute w-6 h-6 bg-primary rounded-full"
              style={{
                top: `${j * 50}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 30px var(--primary)',
                animation: `pulse ${1 + j * 0.3}s ease-in-out infinite`
              }}
            />
          ))}
        </div>
      ))}
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
