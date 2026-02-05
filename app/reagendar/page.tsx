import * as React from "react"
import { Suspense } from "react"

import { ReagendarClient } from "@/app/reagendar/reagendar-client"

export default function ReagendarPage() {
  return (
    <Suspense>
      <ReagendarClient />
    </Suspense>
  )
}
