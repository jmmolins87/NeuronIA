"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Loader } from "@/components/loader"

export function PageLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = React.useState(true)
  const [prevPathname, setPrevPathname] = React.useState(pathname)

  React.useEffect(() => {
    // When pathname changes, show loader
    if (pathname !== prevPathname) {
      setIsLoading(true)
      setPrevPathname(pathname)
    }

    // Hide loader after a delay to allow content to be ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600) // 600ms gives time for data to load

    return () => clearTimeout(timer)
  }, [pathname, prevPathname])

  // Also check on initial mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {isLoading && <Loader />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: "opacity 300ms ease-in-out" }}>
        {children}
      </div>
    </>
  )
}
