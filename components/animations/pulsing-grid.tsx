"use client"

import * as React from "react"

export function PulsingGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(to right, var(--primary) 1px, transparent 1px),
          linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridPulse 3s ease-in-out infinite',
        filter: 'drop-shadow(0 0 5px var(--primary))'
      }} />
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `
          linear-gradient(45deg, var(--primary) 1px, transparent 1px),
          linear-gradient(-45deg, var(--primary) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridPulse 3s ease-in-out infinite reverse',
        filter: 'drop-shadow(0 0 5px var(--primary))'
      }} />
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `gridPulse ${1 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            boxShadow: '0 0 20px var(--primary)'
          }}
        />
      ))}
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
