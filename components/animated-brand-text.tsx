"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedBrandTextProps {
  children: string
  className?: string
}

/**
 * Component that applies animated gradient effect to "ClinvetIA" and "IA" text
 * Renders highlighted tokens with semantic text color
 */
export function AnimatedBrandText({ children, className }: AnimatedBrandTextProps) {
  // Replace "ClinvetIA" and standalone "IA" with spans that have gradient animation
  const processText = (text: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    
    // Regex to match "ClinvetIA" or standalone "IA" (not part of another word)
    const regex = /\b(ClinvetIA|IA)\b/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      
      // Add matched text with gradient
      parts.push(
        <span key={match.index} className="font-semibold text-foreground">
          {match[0]}
        </span>
      )
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    
    return parts.length > 0 ? parts : text
  }

  return (
    <span className={cn(className)}>
      {processText(children)}
    </span>
  )
}
