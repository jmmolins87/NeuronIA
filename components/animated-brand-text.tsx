"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedBrandTextProps {
  children: string
  className?: string
}

/**
 * Component that applies animated gradient effect to "NeuronIA" and "IA" text
 * Uses the gradient-text-pulse class for animation
 */
export function AnimatedBrandText({ children, className }: AnimatedBrandTextProps) {
  // Replace "NeuronIA" and standalone "IA" with spans that have gradient animation
  const processText = (text: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    
    // Regex to match "NeuronIA" or standalone "IA" (not part of another word)
    const regex = /\b(NeuronIA|IA)\b/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      
      // Add matched text with gradient
      parts.push(
        <span key={match.index} className="gradient-text-pulse">
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
