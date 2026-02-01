"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps) {
  return (
    <div className={cn("fixed inset-0 z-[9999] flex items-center justify-center bg-background backdrop-blur-sm", className)}>
      <div className="flex flex-col items-center gap-8">
        {/* Logo with neuronas */}
        <div className="relative w-32 h-32">
          <Image
            src="/logo.svg"
            alt="NeuronIA"
            width={128}
            height={128}
            className="relative z-10"
            priority
          />
          
          {/* Neuronas effect - orbiting and pulsing dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(12)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 12
              const radius = 60
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    top: `50%`,
                    left: `50%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary/60 dark:bg-primary"
                    style={{
                      animation: `neuronPulse 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`,
                      transform: `translate(${radius * Math.cos(angle)}px, ${radius * Math.sin(angle)}px)`,
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* Connection lines effect */}
          <svg className="absolute inset-0 w-full h-full" style={{ transform: 'scale(1.2)' }}>
            {[...Array(12)].map((_, i) => {
              if (i % 3 === 0) {
                const angle1 = (i * Math.PI * 2) / 12
                const angle2 = ((i + 4) * Math.PI * 2) / 12
                const radius = 60
                return (
                  <line
                    key={i}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${radius * Math.cos(angle1)}px)`}
                    y2={`calc(50% + ${radius * Math.sin(angle1)}px)`}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-primary/20 dark:text-primary/30"
                    style={{
                      animation: `lineOpacity 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                )
              }
              return null
            })}
          </svg>
        </div>

        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" 
               style={{ animationDuration: '0.8s' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes neuronPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes lineOpacity {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  )
}
