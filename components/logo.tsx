"use client"

import * as React from "react"
import Image from "next/image"

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 160, height = 102, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ClinvetIA"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
