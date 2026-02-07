import * as React from "react"
import { Suspense } from "react"

import { CancelClient } from "@/app/cancel/cancel-client"

export default function CancelPage() {
  return (
    <Suspense>
      <CancelClient />
    </Suspense>
  )
}
