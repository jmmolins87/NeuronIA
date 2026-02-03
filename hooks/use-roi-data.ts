"use client"

import { useState, useEffect, useCallback } from "react"

export interface ROIData {
  clinicType?: string
  monthlyPatients: number
  avgTicket: number
  missedRate: number
  monthlyRevenue: number
  yearlyRevenue: number
  roi: number
  breakEvenDays: number
  timestamp: number
  accepted?: boolean
}

const ROI_STORAGE_KEY = "neuronia-roi-data"

export function useROIData() {
  const [roiData, setROIData] = useState<ROIData | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(ROI_STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as ROIData
        setROIData(data)
      } catch (error) {
        console.error("Failed to parse ROI data:", error)
      }
    }
  }, [])

  const saveROIData = useCallback((data: ROIData, skipAcceptance = false) => {
    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now(),
      accepted: skipAcceptance ? data.accepted : false,
    }
    localStorage.setItem(ROI_STORAGE_KEY, JSON.stringify(dataWithTimestamp))
    setROIData(dataWithTimestamp)
  }, [])

  const acceptROIData = useCallback(() => {
    if (roiData) {
      const acceptedData = {
        ...roiData,
        accepted: true,
      }
      localStorage.setItem(ROI_STORAGE_KEY, JSON.stringify(acceptedData))
      setROIData(acceptedData)
    }
  }, [roiData])

  const clearROIData = useCallback(() => {
    localStorage.removeItem(ROI_STORAGE_KEY)
    setROIData(null)
  }, [])

  return {
    roiData,
    saveROIData,
    clearROIData,
    acceptROIData,
    hasROIData: !!roiData,
    hasAcceptedROIData: !!roiData && roiData.accepted === true,
  }
}
