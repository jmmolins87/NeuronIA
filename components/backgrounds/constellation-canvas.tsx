"use client"

import * as React from "react"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  colorIndex: number
}

interface ConstellationCanvasProps {
  particleCount?: number
  connectionDistance?: number
  speed?: number
}

export function ConstellationCanvas({
  particleCount = 100,
  connectionDistance = 150,
  speed = 0.3,
}: ConstellationCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const particlesRef = React.useRef<Particle[]>([])
  const rafRef = React.useRef<number | undefined>(undefined)
  const mouseRef = React.useRef({ x: 0, y: 0 })
  const prefersReducedMotion = React.useRef(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion.current = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      initParticles()
    }

    const initParticles = () => {
      const rect = canvas.getBoundingClientRect()
      
      // Colores vibrantes para light y dark mode
      const colors = [
        { light: "rgba(34, 197, 94, 1)", dark: "rgba(133, 255, 189, 1)" },   // Green
        { light: "rgba(14, 165, 233, 1)", dark: "rgba(59, 130, 246, 1)" },   // Cyan/Blue
        { light: "rgba(168, 85, 247, 1)", dark: "rgba(168, 85, 247, 1)" },   // Purple
        { light: "rgba(236, 72, 153, 1)", dark: "rgba(244, 114, 182, 1)" },  // Pink
        { light: "rgba(20, 184, 166, 1)", dark: "rgba(45, 212, 191, 1)" },   // Teal
      ]
      
      particlesRef.current = Array.from({ length: particleCount }, () => {
        const colorIndex = Math.floor(Math.random() * colors.length)
        const isDark = resolvedTheme === "dark"
        const colorObj = colors[colorIndex]
        
        return {
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * speed * 2.5, // Más velocidad
          vy: (Math.random() - 0.5) * speed * 2.5,
          radius: Math.random() * 2 + 1, // Partículas más grandes
          color: isDark ? colorObj.dark : colorObj.light,
          colorIndex,
        }
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const drawConnections = (particles: Particle[]) => {
      const isDark = resolvedTheme === "dark"
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const baseOpacity = isDark ? 0.5 : 0.35
            const opacity = (1 - distance / connectionDistance) * baseOpacity
            
            // Mezcla de colores para las conexiones
            const color1 = particles[i].color.match(/\d+/g) || [133, 255, 189]
            const color2 = particles[j].color.match(/\d+/g) || [133, 255, 189]
            const r = Math.floor((Number(color1[0]) + Number(color2[0])) / 2)
            const g = Math.floor((Number(color1[1]) + Number(color2[1])) / 2)
            const b = Math.floor((Number(color1[2]) + Number(color2[2])) / 2)
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const drawParticles = (particles: Particle[]) => {
      const isDark = resolvedTheme === "dark"
      
      particles.forEach((particle) => {
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 4
        )
        
        // Extraer RGB del color
        const rgb = particle.color.match(/\d+/g) || [133, 255, 189]
        const r = rgb[0]
        const g = rgb[1]
        const b = rgb[2]
        
        // Opacidades más altas para light mode
        const innerOpacity = isDark ? 0.9 : 0.8
        const midOpacity = isDark ? 0.6 : 0.5
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${innerOpacity})`)
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${midOpacity})`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const updateParticles = () => {
      const rect = canvas.getBoundingClientRect()
      particlesRef.current.forEach((particle) => {
        if (prefersReducedMotion.current) return

        // Mouse interaction (más fuerte)
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 200) {
          const force = (200 - distance) / 200
          particle.vx += (dx / distance) * force * 0.03
          particle.vy += (dy / distance) * force * 0.03
        }

        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges con más rebote
        if (particle.x < 0 || particle.x > rect.width) particle.vx *= -0.8
        if (particle.y < 0 || particle.y > rect.height) particle.vy *= -0.8

        // Keep within bounds
        particle.x = Math.max(0, Math.min(rect.width, particle.x))
        particle.y = Math.max(0, Math.min(rect.height, particle.y))

        // Menos damping = más movimiento
        particle.vx *= 0.995
        particle.vy *= 0.995
      })
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      if (!prefersReducedMotion.current) {
        updateParticles()
      }

      drawConnections(particlesRef.current)
      drawParticles(particlesRef.current)

      rafRef.current = requestAnimationFrame(animate)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [particleCount, connectionDistance, speed, resolvedTheme])

  if (!mounted) {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none" />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: resolvedTheme === "dark" ? 0.85 : 0.7 }}
    />
  )
}
