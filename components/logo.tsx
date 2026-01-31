"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 160, height = 40, className }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar flicker mostrando versión light por defecto hasta que monte
  if (!mounted) {
    return (
      <Image
        src="/Logo-NeuronIA-Light.png"
        alt="NeuronIA"
        width={width}
        height={height}
        className={className}
        priority
      />
    )
  }

  const logoSrc = resolvedTheme === "dark" 
    ? "/Logo-NeuronIA-Dark.png" 
    : "/Logo-NeuronIA-Light.png"

  return (
    <Image
      src={logoSrc}
      alt="NeuronIA"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
