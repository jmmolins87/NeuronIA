"use client"

import * as React from "react"
import { Bot } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AiAgentBubbleProps {
  className?: string
}

export function AiAgentBubble({ className }: AiAgentBubbleProps) {
  const [videoFailed, setVideoFailed] = React.useState(false)

  const customSrc = process.env.NEXT_PUBLIC_AI_AGENT_VIDEO_SRC
  const customWebm = process.env.NEXT_PUBLIC_AI_AGENT_VIDEO_SRC_WEBM

  const sources = React.useMemo(() => {
    const list: Array<{ src: string; type: string }> = []
    if (typeof customWebm === "string" && customWebm.trim().length > 0) {
      list.push({ src: customWebm.trim(), type: "video/webm" })
    }
    if (typeof customSrc === "string" && customSrc.trim().length > 0) {
      const ext = customSrc.trim().toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"
      list.push({ src: customSrc.trim(), type: ext })
    }
    list.push({ src: "/videos/avatar/agent.webm", type: "video/webm" })
    list.push({ src: "/videos/avatar/agent.mp4", type: "video/mp4" })
    return list
  }, [customSrc, customWebm])

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 hidden lg:block",
        className
      )}
    >
      <div
        className={cn(
          "group relative size-28 overflow-hidden rounded-full",
          "border border-primary/45 ring-1 ring-primary/20",
          "bg-card/70 backdrop-blur-sm shadow-lg",
          "dark:glow-primary"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10"
        />

        {!videoFailed ? (
          <video
            className="relative z-10 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          >
            {sources.map((s) => (
              <source key={`${s.src}:${s.type}`} src={s.src} type={s.type} />
            ))}
          </video>
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="absolute inset-0 animate-pulse bg-primary/10" aria-hidden />
            <Bot className="size-10 text-primary" aria-hidden />
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-border/50"
        />
      </div>
    </div>
  )
}
