import * as React from "react"
import { cn } from "@/lib/utils"

interface CircuitLinesProps {
  className?: string
}

export function CircuitLines({ className }: CircuitLinesProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none opacity-25 dark:opacity-20 animate-circuit-flow",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1" className="text-gradient-to dark:text-primary">
          {/* Horizontal lines with animated dash */}
          <path 
            d="M0 50 L200 50 L200 100 L400 100" 
            strokeDasharray="8 8"
            className="animate-[dashFlow_4s_linear_infinite]"
          />
          <path 
            d="M800 150 L600 150 L600 200 L400 200" 
            strokeDasharray="8 8"
            className="animate-[dashFlow_5s_linear_infinite_reverse]"
          />
          
          {/* Vertical lines with animated dash */}
          <path 
            d="M300 0 L300 200 L350 200 L350 400" 
            strokeDasharray="8 8"
            className="animate-[dashFlow_6s_linear_infinite]"
          />
          <path 
            d="M700 600 L700 400 L650 400 L650 200" 
            strokeDasharray="8 8"
            className="animate-[dashFlow_4.5s_linear_infinite_reverse]"
          />
          
          {/* Circuit nodes with subtle pulse */}
          <circle cx="200" cy="50" r="3" fill="currentColor" className="animate-pulse" />
          <circle cx="200" cy="100" r="3" fill="currentColor" />
          <circle cx="600" cy="150" r="3" fill="currentColor" className="animate-pulse" />
          <circle cx="600" cy="200" r="3" fill="currentColor" />
          <circle cx="300" cy="200" r="3" fill="currentColor" />
          <circle cx="350" cy="200" r="3" fill="currentColor" className="animate-pulse" />
          <circle cx="700" cy="400" r="3" fill="currentColor" className="animate-pulse" />
          <circle cx="650" cy="400" r="3" fill="currentColor" />
        </g>
      </svg>
    </div>
  )
}
