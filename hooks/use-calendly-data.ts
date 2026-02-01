"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

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

const CALENDLY_STORAGE_KEY = "neuronia-calendly-data"

export function useCalendlyData() {
  const [calendlyData, setCalendlyData] = useState<CalendlyData | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(CALENDLY_STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as CalendlyData
        setCalendlyData(data)
      } catch (error) {
        console.error("Failed to parse Calendly data:", error)
      }
    }
  }, [])

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
