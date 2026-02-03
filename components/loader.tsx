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
            {Array.from({ length: 12 }).map((_, i) => {
              const deg = i * 30
              const delay = i * 0.15
              const rotateClass = `rotate-[${deg}deg]`
              const pulseClass = `animate-[neuronPulse_2s_ease-in-out_${delay.toFixed(2)}s_infinite]`

              return (
                <div
                  key={i}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${rotateClass}`}
                >
                  <div className="translate-x-[60px]">
                    <div className={`w-1.5 h-1.5 rounded-full bg-primary/60 dark:bg-primary ${pulseClass}`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Connection lines effect */}
          <svg className="absolute inset-0 w-full h-full scale-110" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => {
              const delay = i * 0.25
              const animationClass = `animate-[lineOpacity_2s_ease-in-out_${delay.toFixed(2)}s_infinite]`

              return (
                <line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={i % 2 === 0 ? "15%" : "85%"}
                  y2={i < 2 ? "25%" : "75%"}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className={`text-primary/20 dark:text-primary/30 ${animationClass}`}
                />
              )
            })}
          </svg>
        </div>

        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-[spin_0.8s_linear_infinite]"></div>
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
