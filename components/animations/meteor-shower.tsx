"use client"

import * as React from "react"

export function MeteorShower() {
  const meteors = 25

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: meteors }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-gradient-to-b from-primary via-primary to-transparent"
          style={{
            width: `${1.5 + Math.random() * 2}px`,
            height: `${50 + Math.random() * 80}px`,
            left: `${Math.random() * 120 - 10}%`,
            top: `-150px`,
            transform: 'rotate(45deg)',
            animation: `meteor ${2.5 + Math.random() * 3}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.4,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${8 + Math.random() * 12}px var(--primary)`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes meteor {
          0% {
            transform: translateY(0) translateX(0) rotate(45deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(50px) translateX(50px) rotate(45deg) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) translateX(120vh) rotate(45deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
