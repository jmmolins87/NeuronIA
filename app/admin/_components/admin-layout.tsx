"use client"

import * as React from "react"
import type { AdminSession } from "@/lib/admin-auth"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"
import { Sidebar } from "@/app/admin/_components/sidebar"
import { HeaderBar } from "@/app/admin/_components/header-bar"
import { AdminSessionProvider } from "./admin-session-provider"

interface AdminLayoutProps {
  children: React.ReactNode
  session: AdminSession
}

export function AdminLayout({ children, session }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-background">
        <HeaderBar session={session} onOpenMobileNav={() => setMobileOpen(true)} />

        <div className="mx-auto flex w-full max-w-screen-2xl">
          <Sidebar
            className="sticky top-16 hidden md:flex"
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((v) => !v)}
          />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
              {children}
            </div>
          </main>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <Sidebar
              className="h-full w-full"
              collapsed={false}
              fullHeight
              onToggleCollapsed={() => {}}
            />
          </SheetContent>
        </Sheet>

        <Toaster position="top-right" />
      </div>
    </AdminSessionProvider>
  )
}
