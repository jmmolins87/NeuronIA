"use client"

import * as React from "react"

interface FloatingParticlesProps {
  count?: number
  color?: string
  size?: "sm" | "md" | "lg"
}

type ParticleSize = NonNullable<FloatingParticlesProps["size"]>

export function FloatingParticles({ 
  count = 60, 
  color = "primary",
  size = "lg"
}: FloatingParticlesProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  }

  const speedRange: Record<ParticleSize, readonly [number, number]> = {
    sm: [3, 6],
    md: [2.5, 4.5],
    lg: [2, 5],
  }

  const [minSpeed, maxSpeed] = speedRange[size]

  const colorClasses = {
    primary: "bg-primary",
    accent: "bg-accent",
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100
        const top = (i * 53) % 100
        const duration = minSpeed + ((maxSpeed - minSpeed) * ((i % 10) + 1)) / 11
        const delay = ((i % 7) * 0.35) % 3

        const blurClass =
          size === "sm" ? "blur-0" : size === "md" ? "blur-[1px]" : "blur-sm"
        const opacityClass = size === "sm" ? "opacity-40" : "opacity-70"
        const animationClass = `animate-[floatSoft_${duration.toFixed(2)}s_ease-in-out_${delay.toFixed(2)}s_infinite]`

        return (
          <div
            key={i}
            className={`absolute rounded-full left-[${left}%] top-[${top}%] ${sizeClasses[size]} ${opacityClass} ${blurClass} ${animationClass} ${
              colorClasses[color as keyof typeof colorClasses] || colorClasses.primary
            }`}
          />
        )
      })}
      <style jsx>{`
        @keyframes floatSoft {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.65;
          }
          50% {
            transform: translate3d(24px, -18px, 0) scale(1.35) rotate(12deg);
            opacity: 1;
          }
          90% {
            opacity: 0.65;
          }
        }
      `}</style>
    </div>
  )
}
