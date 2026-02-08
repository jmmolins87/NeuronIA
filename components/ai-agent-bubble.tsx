"use client"

import * as React from "react"
import { Bot } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AiAgentBubbleProps {
  className?: string
}

const CUSTOM_SOURCES_JSON = process.env.NEXT_PUBLIC_AI_AGENT_VIDEO_SOURCES ?? ""
const CUSTOM_SRC = process.env.NEXT_PUBLIC_AI_AGENT_VIDEO_SRC ?? ""
const CUSTOM_WEBM = process.env.NEXT_PUBLIC_AI_AGENT_VIDEO_SRC_WEBM ?? ""

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parseCustomSourcesJson(value: string): Array<{ src: string; type?: string }> {
  const trimmed = value.trim()
  if (!trimmed) return []
  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return []

    const out: Array<{ src: string; type?: string }> = []
    for (const item of parsed) {
      if (!isRecord(item)) continue
      const src = item.src
      const type = item.type
      if (typeof src !== "string") continue
      const srcTrimmed = src.trim()
      if (!srcTrimmed) continue
      out.push({ src: srcTrimmed, ...(typeof type === "string" && type.trim() ? { type: type.trim() } : {}) })
    }
    return out
  } catch {
    return []
  }
}

function buildVideoSources(): Array<{ src: string; type?: string }> {
  const list: Array<{ src: string; type?: string }> = []

  for (const s of parseCustomSourcesJson(CUSTOM_SOURCES_JSON)) {
    list.push(s)
  }

  if (CUSTOM_WEBM.trim()) list.push({ src: CUSTOM_WEBM.trim(), type: "video/webm" })
  if (CUSTOM_SRC.trim()) {
    const v = CUSTOM_SRC.trim()
    const type = v.toLowerCase().endsWith(".webm") ? "video/webm" : v.toLowerCase().endsWith(".ogv") ? "video/ogg" : "video/mp4"
    list.push({ src: v, type })
  }

  // Default paths (drop your files into public/videos/avatar/)
  list.push({ src: "/videos/avatar/agent.webm", type: "video/webm" })
  list.push({ src: "/videos/avatar/agent.mp4", type: "video/mp4" })
  list.push({ src: "/videos/avatar/agent.ogv", type: "video/ogg" })
  list.push({ src: "/videos/avatar/agent.mov", type: "video/quicktime" })

  // Alternate common names
  list.push({ src: "/videos/avatar/avatar.webm", type: "video/webm" })
  list.push({ src: "/videos/avatar/avatar.mp4", type: "video/mp4" })

  const seen = new Set<string>()
  return list.filter((s) => {
    if (seen.has(s.src)) return false
    seen.add(s.src)
    return true
  })
}

export function AiAgentBubble({ className }: AiAgentBubbleProps) {
  const [videoFailed, setVideoFailed] = React.useState(false)
  
  // Use the known video directly without probing
  const selected = React.useMemo(() => {
    return { src: "/videos/avatar/avatar.mp4", type: "video/mp4" }
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 block md:bottom-6 md:right-6",
        className
      )}
    >
      <div
        className={cn(
          "group relative size-24 overflow-hidden rounded-full md:size-32",
          "border border-primary/45 ring-1 ring-primary/20",
          "bg-card/70 backdrop-blur-sm shadow-lg",
          "dark:glow-primary"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-accent/10"
        />

        {!videoFailed && selected ? (
          <video
            className="relative z-10 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          >
            <source src={selected.src} type={selected.type} />
          </video>
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="absolute inset-0 animate-pulse bg-primary/10" aria-hidden />
            <div className="flex flex-col items-center gap-2 px-3 text-center">
              <Bot className="size-8 text-primary md:size-12" aria-hidden />
              <div className="text-[10px] font-semibold text-muted-foreground md:text-xs">
                {process.env.NODE_ENV === "development" ? "Missing avatar video" : "Agent"}
              </div>
            </div>
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
