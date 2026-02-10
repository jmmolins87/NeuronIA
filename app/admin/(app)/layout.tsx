import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import { AdminLayout } from "@/app/admin/_components/admin-layout"
import { getCurrentAdmin } from "@/lib/admin-auth-v2"

export const metadata: Metadata = {
  title: "ClinvetIA Admin",
}

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated
  const session = await getCurrentAdmin()
  
  if (!session) {
    // Check for demo session
    const cookieStore = await cookies()
    const demoCookie = cookieStore.get('clinvetia_admin')?.value
    
    if (demoCookie === 'demo-session') {
      // Create mock session for demo
      const mockSession = {
        userId: 'demo-user',
        username: 'demo',
        email: null,
        role: 'ADMIN' as const,
        mode: 'DEMO' as const,
        isActive: true,
      }
      return <AdminLayout session={mockSession}>{children}</AdminLayout>
    }
    
    redirect("/admin/login")
  }

  // Transform AdminSessionData to AdminSession
  const adminSession = {
    userId: session.admin.id,
    username: session.admin.username,
    email: session.admin.email,
    role: session.admin.role,
    mode: session.admin.mode,
    isActive: session.admin.isActive,
  }

  return <AdminLayout session={adminSession}>{children}</AdminLayout>
}
