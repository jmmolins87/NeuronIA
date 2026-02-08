"use client"

import * as React from "react"

export function HeroAmbientBg() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {/* Impactful gradient orbs - highly visible */}
      <div className="absolute inset-0">
        {/* Top left - Primary green glow */}
        <div
          className="absolute rounded-full animate-pulse-slow"
          style={{
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(133, 255, 189, 0.8) 0%, rgba(133, 255, 189, 0.4) 40%, transparent 70%)",
            filter: "blur(100px)",
            top: "-15%",
            left: "-10%",
          }}
        />

        {/* Top right - Purple/magenta glow */}
        <div
          className="absolute rounded-full animate-pulse-slower"
          style={{
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(168, 85, 247, 0.35) 40%, transparent 70%)",
            filter: "blur(90px)",
            top: "0%",
            right: "-8%",
          }}
        />

        {/* Center bottom - Cyan/blue glow */}
        <div
          className="absolute rounded-full animate-pulse-slowest"
          style={{
            width: "900px",
            height: "900px",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 70%)",
            filter: "blur(110px)",
            bottom: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* Bottom right - Gold/yellow accent */}
        <div
          className="absolute rounded-full animate-pulse-slow"
          style={{
            width: "650px",
            height: "650px",
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.65) 0%, rgba(251, 191, 36, 0.3) 40%, transparent 70%)",
            filter: "blur(85px)",
            bottom: "-5%",
            right: "5%",
          }}
        />

        {/* Mid left - Teal accent */}
        <div
          className="absolute rounded-full animate-pulse-slower"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(20, 184, 166, 0.6) 0%, rgba(20, 184, 166, 0.25) 40%, transparent 70%)",
            filter: "blur(80px)",
            top: "40%",
            left: "0%",
          }}
        />
      </div>

      {/* Animated light sweep */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, transparent 0%, rgba(133, 255, 189, 0.2) 50%, transparent 100%)",
          backgroundSize: "200% 200%",
          animation: "shimmer-diagonal 12s ease-in-out infinite",
        }}
      />
    </div>
  )
}
