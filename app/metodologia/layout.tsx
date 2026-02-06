import { notFound } from "next/navigation"

export default function MetodologiaLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  void children
  notFound()
  return null
}
