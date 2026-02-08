import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AvatarChat } from "@/components/AvatarChat"

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AvatarChat />
    </div>
  )
}
