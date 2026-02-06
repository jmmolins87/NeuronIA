"use client"

import * as React from "react"

interface AnimatedNumberProps {
  value: string
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 2000, className = "" }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState("0")
  const [inView, setInView] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const node = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold: 0.3 }
    )

    if (node) {
      observer.observe(node)
    }

    return () => {
      if (node) {
        observer.unobserve(node)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!inView) return

    // Parse the value to extract number and suffix (%, +, etc.)
    const match = value.match(/^([+\-]?)(\d+)(.*)$/)
    if (!match) {
      setDisplayValue(value)
      return
    }

    const [, prefix, numStr, suffix] = match
    const targetNumber = parseInt(numStr, 10)
    
    if (isNaN(targetNumber)) {
      setDisplayValue(value)
      return
    }

    const startTime = Date.now()
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentNumber = Math.floor(easeOut * targetNumber)
      
      setDisplayValue(`${prefix}${currentNumber}${suffix}`)

      if (now < endTime) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  )
}
