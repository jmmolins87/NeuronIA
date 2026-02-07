import * as React from "react"
import { Suspense } from "react"

import { RescheduleClient } from "@/app/reschedule/reschedule-client"

export default function ReschedulePage() {
  return (
    <Suspense>
      <RescheduleClient />
    </Suspense>
  )
}
