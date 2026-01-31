import * as React from "react"
import { cn } from "@/lib/utils"

interface GridPatternProps {
  className?: string
  squares?: number[][]
}

export function GridPattern({ className, squares = [] }: GridPatternProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none opacity-50 dark:opacity-30",
        className
      )}
      aria-hidden="true"
    >
      <svg className="h-full w-full animate-grid-drift" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            x="0"
            y="0"
          >
            <path
              d="M0 32V.5H32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity="0.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" className="text-gradient-to dark:text-primary" />
        {squares.map(([x, y], index) => (
          <rect
            key={index}
            width="32"
            height="32"
            x={x * 32}
            y={y * 32}
            fill="currentColor"
            fillOpacity="0.15"
            className="text-primary animate-pulse"
            style={{ 
              animationDelay: `${index * 0.3}s`,
              animationDuration: `${2 + index * 0.5}s`
            }}
          />
        ))}
      </svg>
    </div>
  )
}
