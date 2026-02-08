"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { MessageCircle, Send, X, Sparkles } from "lucide-react"

import { useTranslation } from "@/components/providers/i18n-provider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ChatRole = "user" | "assistant"
type ChatMessage = { role: ChatRole; content: string }

function stateKey(sessionId: string): string {
  return `clinvetia-chat-state:${sessionId}`
}

function loadAgentState(sessionId: string): unknown {
  try {
    const raw = sessionStorage.getItem(stateKey(sessionId))
    return raw ? (JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}

function saveAgentState(sessionId: string, state: unknown) {
  try {
    sessionStorage.setItem(stateKey(sessionId), JSON.stringify(state))
  } catch {
    // ignore
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem("clinvetia-chat-session")
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem("clinvetia-chat-session", id)
    return id
  } catch {
    return "fallback-session"
  }
}

function storageKey(sessionId: string): string {
  return `clinvetia-chat-history:${sessionId}`
}

function loadHistory(sessionId: string): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(storageKey(sessionId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: ChatMessage[] = []
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue
      const r = (item as { role?: unknown }).role
      const c = (item as { content?: unknown }).content
      if ((r === "user" || r === "assistant") && typeof c === "string" && c.trim()) {
        out.push({ role: r, content: c })
      }
    }
    return out.slice(-20)
  } catch {
    return []
  }
}

function saveHistory(sessionId: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(storageKey(sessionId), JSON.stringify(messages.slice(-20)))
  } catch {
    // ignore
  }
}

export function AvatarChat({ className }: { className?: string }) {
  const { t, locale } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [videoFailed, setVideoFailed] = React.useState(false)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [agentState, setAgentState] = React.useState<unknown>(null)
  const [quickReplies, setQuickReplies] = React.useState<string[]>([])
  const [handoffUrl, setHandoffUrl] = React.useState("/reservar")
  const [handoffLabel, setHandoffLabel] = React.useState<string>(() => t("chat_cta"))
  const [hold, setHold] = React.useState<{ sessionToken: string | null; expiresAt: string | null }>({
    sessionToken: null,
    expiresAt: null,
  })
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const selected = React.useMemo(() => {
    return { src: "/videos/avatar/avatar.mp4", type: "video/mp4" }
  }, [])

  React.useEffect(() => {
    if (!open) return
    const id = getOrCreateSessionId()
    setSessionId(id)
    const history = loadHistory(id)
    if (history.length > 0) {
      setMessages(history)
      setAgentState(loadAgentState(id))
      return
    }

    // Seed message
    const seed: ChatMessage[] = [
      {
        role: "assistant",
        content:
          locale === "en"
            ? "Hi! Want to book a demo? Tell me a day and a preferred time window."
            : "Hola! Quieres reservar una demo? Dime un dia y una franja horaria.",
      },
    ]
    setMessages(seed)
    saveHistory(id, seed)

    setAgentState(loadAgentState(id))
    setQuickReplies([t("chat_quick_book"), t("chat_quick_pricing"), t("chat_quick_howworks"), t("chat_quick_roi")])
  }, [open, locale, t])

  React.useEffect(() => {
    if (!sessionId) return
    saveHistory(sessionId, messages)
  }, [messages, sessionId])

  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 60)
    return () => window.clearTimeout(id)
  }, [messages, open])

  // Handler for wheel scroll - uses React synthetic event
  const handleContainerWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = container
    const isScrollable = scrollHeight > clientHeight
    
    if (!isScrollable) return
    
    const isAtTop = scrollTop === 0 && e.deltaY < 0
    const isAtBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0
    
    // Only prevent default if we're not at the boundaries
    if (!isAtTop && !isAtBottom) {
      e.stopPropagation()
    }
  }, [])

  async function send(text: string) {
    if (!text.trim() || sending) return
    const sid = sessionId ?? getOrCreateSessionId()
    if (!sessionId) setSessionId(sid)

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(nextMessages)
    setInput("")
    setSending(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          locale,
          timezone: "Europe/Madrid",
          page: pathname || "/",
          messages: nextMessages,
          agentState,
        }),
      })

      const json: unknown = await res.json().catch(() => null)
      if (!isRecord(json) || json.ok !== true) {
        const msg = t("chat_error_retry")
        setMessages((p) => [...p, { role: "assistant", content: msg }])
        return
      }

      const reply = typeof json.reply === "string" ? json.reply : ""
      setMessages((p) => [...p, { role: "assistant", content: reply }])

      const ui = isRecord(json.ui) ? json.ui : null

      if (isRecord(json.agentState)) {
        setAgentState(json.agentState)
        saveAgentState(sid, json.agentState)
      }
      if (ui && Array.isArray(ui.suggestedQuickReplies)) {
        setQuickReplies(ui.suggestedQuickReplies.filter((s) => typeof s === "string").slice(0, 6) as string[])
      }

      if (ui && typeof ui.handoffUrl === "string" && ui.handoffUrl.startsWith("/")) setHandoffUrl(ui.handoffUrl)
      if (ui && typeof ui.handoffLabel === "string") setHandoffLabel(ui.handoffLabel)

      // Agent handoff (no data in URL)
      if (ui && isRecord(ui.handoffPayload) && typeof ui.handoffUrl === "string" && ui.handoffUrl.startsWith("/")) {
        try {
          sessionStorage.setItem("clinvetia_handoff", JSON.stringify(ui.handoffPayload))
        } catch {
          // ignore
        }
        router.push(ui.handoffUrl)
        return
      }

      if (ui && isRecord(ui.hold)) {
        setHold({
          sessionToken: typeof ui.hold.sessionToken === "string" ? ui.hold.sessionToken : null,
          expiresAt: typeof ui.hold.expiresAt === "string" ? ui.hold.expiresAt : null,
        })
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={cn("fixed bottom-6 right-6", open ? "z-[70]" : "z-50", className)}>
      {open ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none fixed z-[80]",
            "top-20 right-4",
            "sm:top-auto sm:bottom-10",
            "sm:right-[23rem] md:right-[29rem]",
            "size-32 sm:size-36 md:size-40",
            "overflow-hidden rounded-full",
            "border border-primary/45 ring-1 ring-primary/20",
            "bg-card/70 backdrop-blur-sm shadow-2xl",
            "dark:glow-primary",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          {!videoFailed ? (
            <video
              className="h-full w-full object-cover"
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
            <div className="flex h-full w-full items-center justify-center bg-muted/40">
              <Image src="/logo.png" alt="ClinvetIA" width={44} height={44} className="rounded-full" />
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-border/50"
          />
        </div>
      ) : null}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="lg"
            className={cn(
              "h-16 w-16 md:h-24 md:w-24 rounded-full p-0",
              "bg-card/80 backdrop-blur-sm",
              "border border-primary/40 ring-1 ring-primary/20 shadow-lg",
              "hover:bg-card",
              "dark:glow-primary",
              open && "pointer-events-none opacity-0"
            )}
            aria-label={t("chat_open")}
          >
            <div className="relative h-full w-full overflow-hidden rounded-full">
              {!videoFailed ? (
                <video
                  className="h-full w-full object-cover"
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
                <div className="flex h-full w-full items-center justify-center bg-muted/40">
                  <Image src="/logo.png" alt="ClinvetIA" width={36} height={36} className="rounded-full" />
                </div>
              )}
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          showCloseButton={false}
          overlayClassName="bg-white/35 dark:bg-black/55 backdrop-blur-xl backdrop-saturate-150"
          className="w-full sm:max-w-md p-0 bg-background/85 supports-[backdrop-filter]:bg-background/65 backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="flex h-dvh min-h-0 flex-col bg-background">
            <SheetHeader className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-card">
                    <Image src="/logo.png" alt="ClinvetIA" fill className="object-cover" sizes="36px" />
                  </div>
                  <div className="min-w-0">
                    <SheetTitle className="text-base">
                      {t("chat_title")}
                    </SheetTitle>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      <span className="truncate">{locale === "en" ? "Book a demo" : "Reservar demo"}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label={t("chat_close")}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            <div 
              ref={scrollContainerRef}
              onWheel={handleContainerWheel}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
              style={{ 
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                pointerEvents: 'auto',
                isolation: 'isolate'
              }}
            >
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-2",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="relative mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-card">
                        <Image src="/logo.png" alt="ClinvetIA" fill className="object-cover" sizes="28px" />
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {hold.sessionToken ? (
                  <div className="rounded-xl border border-border bg-card/70 p-3 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
                        <span>{t("chat_hold_confirmed")}</span>
                      </div>
                      {hold.expiresAt ? <span className="font-mono">{hold.expiresAt}</span> : null}
                    </div>
                  </div>
                ) : null}

                <div ref={scrollRef} />
              </div>
            </div>

            {quickReplies.length > 0 ? (
              <div className="border-t border-border px-4 py-2">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((q) => (
                    <Button
                      key={q}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-full"
                      onClick={() => void send(q)}
                      disabled={sending}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chat_placeholder")}
                  className="min-h-11 max-h-32 resize-none overflow-y-auto"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      void send(input)
                    }
                  }}
                  disabled={sending}
                />
                <Button
                  type="button"
                  onClick={() => void send(input)}
                  disabled={sending || !input.trim()}
                  className="shrink-0"
                  aria-label={t("chat_send")}
                >
                  <Send className="h-4 w-4" aria-hidden />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <a
                  href={handoffUrl}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold",
                    "bg-sky-50 text-black hover:bg-sky-100",
                    "dark:bg-black dark:text-white dark:hover:bg-neutral-900",
                    "border border-border"
                  )}
                >
                  {handoffLabel || t("chat_cta")}
                </a>
                <div className="text-xs text-muted-foreground">
                  {locale === "en" ? "No medical advice" : "Sin consejo medico"}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
