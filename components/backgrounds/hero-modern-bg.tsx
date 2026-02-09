"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function HeroModernBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = resolvedTheme === "dark"

    // Setup canvas size
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    setupCanvas()

    // Particle system
    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      hue: number
    }

    const particles: Particle[] = []
    const particleCount = 60

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() > 0.5 ? 210 : 190, // Blue or cyan tones
      })
    }

    let animationId: number
    let time = 0

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Clear canvas completely - no trails
      ctx.clearRect(0, 0, width, height)

      time += 0.005

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wave motion
        const wave = Math.sin(time + index * 0.1) * 0.5
        particle.y += wave

        // Wrap around edges
        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        // Draw particle with glow - adjust brightness for theme
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4
        )

        const lightness = isDark ? 75 : 55
        const opacity = isDark ? particle.opacity * 1.4 : particle.opacity * 0.7

        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, ${lightness}%, ${opacity})`)
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, ${lightness - 10}%, ${opacity * 0.5})`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, ${lightness - 20}%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections between nearby particles
        particles.forEach((otherParticle, otherIndex) => {
          if (index === otherIndex) return

          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const baseOpacity = (1 - distance / 150) * (isDark ? 0.25 : 0.1)
            const lineLightness = isDark ? 65 : 50
            ctx.strokeStyle = `hsla(${particle.hue}, 100%, ${lineLightness}%, ${baseOpacity})`
            ctx.lineWidth = isDark ? 0.8 : 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      setupCanvas()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [mounted, resolvedTheme])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-30 dark:opacity-50">
        <div
          className="absolute inset-0 animate-mesh-1"
          style={{
            background: isDark
              ? "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 animate-mesh-2"
          style={{
            background: isDark
              ? "radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.35) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.25) 0%, transparent 50%)"
              : "radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.22) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.18) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 animate-mesh-3"
          style={{
            background: isDark
              ? "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 60%)"
              : "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-75"
        style={{ mixBlendMode: isDark ? "screen" : "multiply" }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.15]"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(59, 130, 246, 0.6) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59, 130, 246, 0.6) 1px, transparent 1px)`
            : `linear-gradient(rgba(59, 130, 246, 0.45) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59, 130, 246, 0.45) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Light sweep effect */}
      <div
        className="absolute inset-0 opacity-15 dark:opacity-25"
        style={{
          background: isDark
            ? "linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.4) 40%, rgba(168, 85, 247, 0.3) 60%, transparent 100%)"
            : "linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.25) 40%, rgba(168, 85, 247, 0.2) 60%, transparent 100%)",
          backgroundSize: "200% 200%",
          animation: "sweep 15s ease-in-out infinite",
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-40"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.3) 100%)"
            : "radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.15) 100%)",
        }}
      />
    </div>
  )
}
