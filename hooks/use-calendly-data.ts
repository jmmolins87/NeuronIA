"use client"

import { useCallback, useMemo, useState } from "react"

export interface CalendlyData {
  eventUri: string
  inviteeUri: string
  eventType: string
  inviteeName?: string
  inviteeEmail?: string
  timestamp: number
  scheduledDate?: string
  scheduledTime?: string
  message?: string
}

const CALENDLY_STORAGE_KEY = "clinvetia-calendly-data"

export function useCalendlyData() {
  const [calendlyData, setCalendlyData] = useState<CalendlyData | null>(() => {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(CALENDLY_STORAGE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored) as CalendlyData
    } catch (error) {
      console.error("Failed to parse Calendly data:", error)
      return null
    }
  })

  const saveCalendlyData = useCallback((data: CalendlyData) => {
    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now(),
    }
    localStorage.setItem(CALENDLY_STORAGE_KEY, JSON.stringify(dataWithTimestamp))
    setCalendlyData(dataWithTimestamp)
  }, [])

  const clearCalendlyData = useCallback(() => {
    localStorage.removeItem(CALENDLY_STORAGE_KEY)
    setCalendlyData(null)
  }, [])

  const hasCalendlyData = useMemo(() => !!calendlyData, [calendlyData])

  return {
    calendlyData,
    saveCalendlyData,
    clearCalendlyData,
    hasCalendlyData,
  }
}
