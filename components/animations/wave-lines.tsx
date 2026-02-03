"use client"

import * as React from "react"

interface WaveLinesProps {
  count?: number
  color?: string
}

export function WaveLines({ count = 12, color = "primary" }: WaveLinesProps) {
  const stopColor = color === "accent" ? "var(--accent)" : "var(--primary)"

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={stopColor} stopOpacity="0" />
            <stop offset="50%" stopColor={stopColor} stopOpacity="1" />
            <stop offset="100%" stopColor={stopColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: count }).map((_, i) => {
          const duration = 3 + i * 0.35
          const delay = i * 0.2
          const strokeWidth = 3 + (i % 3)
          const animationClass = `animate-[wave_${duration.toFixed(2)}s_linear_${delay.toFixed(2)}s_infinite]`

          return (
            <path
              key={i}
              d={`M 0 ${30 + i * 50} Q 250 ${10 + i * 50} 500 ${30 + i * 50} T 1000 ${30 + i * 50} T 1500 ${30 + i * 50} T 2000 ${30 + i * 50} T 2500 ${30 + i * 50}`}
              stroke="url(#waveGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              filter="url(#glow)"
              className={animationClass}
            />
          )
        })}
      </svg>
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(-500px) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
