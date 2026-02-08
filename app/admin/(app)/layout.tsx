import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import { AdminLayout } from "@/app/admin/_components/admin-layout"
import { getCurrentAdmin } from "@/lib/admin-auth"

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
        role: 'ADMIN' as const,
        isActive: true,
      }
      return <AdminLayout session={mockSession}>{children}</AdminLayout>
    }
    
    redirect("/admin/login")
  }

  return <AdminLayout session={session}>{children}</AdminLayout>
}
