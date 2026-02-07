import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AiAgentBubble } from "@/components/ai-agent-bubble"

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiAgentBubble />
    </div>
  )
}
