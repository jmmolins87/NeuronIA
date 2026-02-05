import * as React from "react"
import { Suspense } from "react"

import { CanceladoClient } from "@/app/cancelado/cancelado-client"

export default function CanceladoPage() {
  return (
    <Suspense>
      <CanceladoClient />
    </Suspense>
  )
}
