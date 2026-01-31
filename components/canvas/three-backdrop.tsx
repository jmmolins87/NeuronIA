"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ThreeBackdropProps {
  className?: string
}

export function ThreeBackdrop({ className }: ThreeBackdropProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return

    let animationFrameId: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scene: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let camera: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let particles: any

    const initThree = async () => {
      try {
        const THREE = await import("three")
        const canvas = canvasRef.current
        if (!canvas) return

        // Scene setup
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
        camera.position.z = 5

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Create particle system
        const particleCount = 200
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 10
          positions[i + 1] = (Math.random() - 0.5) * 10
          positions[i + 2] = (Math.random() - 0.5) * 10

          velocities[i] = (Math.random() - 0.5) * 0.01
          velocities[i + 1] = (Math.random() - 0.5) * 0.01
          velocities[i + 2] = (Math.random() - 0.5) * 0.01
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        )

        const material = new THREE.PointsMaterial({
          color: 0x00ff9a,
          size: 0.08,
          transparent: true,
          opacity: 0.8,
        })

        particles = new THREE.Points(geometry, material)
        scene.add(particles)

        // Animation loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate)

          // Rotate particles slowly
          particles.rotation.y += 0.001
          particles.rotation.x += 0.0005

          // Update particle positions
          const positions = particles.geometry.attributes.position.array as Float32Array
          for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i]
            positions[i + 1] += velocities[i + 1]
            positions[i + 2] += velocities[i + 2]

            // Boundary check
            if (Math.abs(positions[i]) > 5) velocities[i] *= -1
            if (Math.abs(positions[i + 1]) > 5) velocities[i + 1] *= -1
            if (Math.abs(positions[i + 2]) > 5) velocities[i + 2] *= -1
          }
          particles.geometry.attributes.position.needsUpdate = true

          renderer.render(scene, camera)
        }

        animate()

        // Handle resize
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener("resize", handleResize)

        return () => {
          window.removeEventListener("resize", handleResize)
        }
      } catch (error) {
        console.error("Failed to initialize Three.js:", error)
      }
    }

    initThree()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (renderer) {
        renderer.dispose()
      }
      if (particles) {
        particles.geometry.dispose()
        particles.material.dispose()
      }
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) {
    // Static fallback for reduced motion
    return (
      <div
        className={cn(
          "absolute inset-0 pointer-events-none opacity-5 dark:opacity-10",
          className
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10" />
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "absolute inset-0 pointer-events-none opacity-40 dark:opacity-50",
        className
      )}
      aria-hidden="true"
    />
  )
}
