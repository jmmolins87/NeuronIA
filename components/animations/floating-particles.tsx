"use client"

import * as React from "react"

interface FloatingParticlesProps {
  count?: number
  color?: string
  size?: "sm" | "md" | "lg"
}

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

  const sizeConfig = {
    sm: {
      blur: 0.5,
      shadow: 5,
      movement: 50,
      speed: [3, 6],
      scale: [0.8, 1.2]
    },
    md: {
      blur: 1.5,
      shadow: 15,
      movement: 100,
      speed: [2.5, 4.5],
      scale: [0.7, 1.5]
    },
    lg: {
      blur: 2.5,
      shadow: 25,
      movement: 200,
      speed: [2, 5],
      scale: [0.5, 2.5]
    }
  }

  const config = sizeConfig[size]

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
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${sizeClasses[size]} ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${config.speed[0] + Math.random() * (config.speed[1] - config.speed[0])}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            filter: `blur(${config.blur + Math.random() * config.blur}px)`,
            boxShadow: `0 0 ${config.shadow + Math.random() * config.shadow}px currentColor`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(${config.scale[0]}) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${size === 'sm' ? 0.3 : 0.8};
          }
          50% {
            transform: translate(${Math.random() * config.movement - config.movement/2}px, ${Math.random() * config.movement - config.movement/2}px) scale(${config.scale[1]}) rotate(${Math.random() * 360}deg);
            opacity: ${size === 'sm' ? 0.5 : 1};
          }
          90% {
            opacity: ${size === 'sm' ? 0.3 : 0.8};
          }
          100% {
            transform: translate(0, 0) scale(${config.scale[0]}) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
