"use client"

import * as React from "react"

interface WaveLinesProps {
  count?: number
  color?: string
}

export function WaveLines({ count = 12, color = "primary" }: WaveLinesProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: count }).map((_, i) => (
          <path
            key={i}
            d={`M 0 ${30 + i * 50} Q 250 ${10 + i * 50} 500 ${30 + i * 50} T 1000 ${30 + i * 50} T 1500 ${30 + i * 50} T 2000 ${30 + i * 50} T 2500 ${30 + i * 50}`}
            stroke="url(#waveGradient)"
            strokeWidth={`${3 + Math.random() * 2}`}
            fill="none"
            filter="url(#glow)"
            className="animate-wave"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </svg>
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(-500px) translateY(${Math.random() * 20 - 10}px);
          }
        }
        .animate-wave {
          animation: wave linear infinite;
        }
      `}</style>
    </div>
  )
}
