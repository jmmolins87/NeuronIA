import type { Metadata } from "next"

import { AdminLayout } from "@/app/admin/_components/admin-layout"

export const metadata: Metadata = {
  title: "ClinvetIA Admin",
}

export default function AdminAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
