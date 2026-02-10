"use client"

/**
 * Demo Data Store (Client-side)
 * 
 * Manages DEMO mode data on the client. Provides filtering, pagination,
 * and CRUD operations that only affect local state (no API calls).
 */

import * as React from "react"

import type {
  DemoDataSet,
  DemoBooking,
  DemoLead,
  DemoROICalculation,
  DemoBookingStatus
} from "@/lib/admin/demo-data"
import { generateDemoData, getDefaultDemoData } from "@/lib/admin/demo-data"

// ============================================================================
// Types
// ============================================================================

export interface BookingFilters {
  status?: DemoBookingStatus | "ALL"
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface LeadFilters {
  status?: "ALL" | "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
  search?: string
  source?: "ALL" | "WEB_FORM" | "EMAIL" | "WHATSAPP"
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface DemoStoreContextValue {
  // Data
  data: DemoDataSet | null
  
  // Bookings
  bookings: DemoBooking[]
  bookingFilters: BookingFilters
  bookingPagination: PaginationState
  setBookingFilters: (filters: BookingFilters) => void
  setBookingPage: (page: number) => void
  cancelBooking: (id: string) => void
  
  // Leads
  leads: DemoLead[]
  leadFilters: LeadFilters
  leadPagination: PaginationState
  setLeadFilters: (filters: LeadFilters) => void
  setLeadPage: (page: number) => void
  
  // ROI Calculations
  roiCalculations: DemoROICalculation[]
  
  // Actions
  regenerateData: (seed?: string) => void
  resetFilters: () => void
  
  // Metadata
  isLoading: boolean
  seed: string | null
}

// ============================================================================
// Context
// ============================================================================

const DemoStoreContext = React.createContext<DemoStoreContextValue | undefined>(undefined)

// ============================================================================
// Provider
// ============================================================================

const DEFAULT_PAGE_SIZE = 20

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<DemoDataSet | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Booking state
  const [bookingFilters, setBookingFilters] = React.useState<BookingFilters>({
    status: "ALL",
    search: "",
    dateFrom: undefined,
    dateTo: undefined
  })
  const [bookingPage, setBookingPage] = React.useState(1)
  
  // Lead state
  const [leadFilters, setLeadFilters] = React.useState<LeadFilters>({
    status: "ALL",
    search: "",
    source: "ALL"
  })
  const [leadPage, setLeadPage] = React.useState(1)

  // Initialize with default data
  React.useEffect(() => {
    setIsLoading(true)
    const defaultData = getDefaultDemoData()
    setData(defaultData)
    setIsLoading(false)
  }, [])

  // Filter bookings
  const filteredBookings = React.useMemo(() => {
    if (!data) return []
    
    let result = data.bookings
    
    // Filter by status
    if (bookingFilters.status && bookingFilters.status !== "ALL") {
      result = result.filter(b => b.status === bookingFilters.status)
    }
    
    // Filter by search (name, email, clinic)
    if (bookingFilters.search) {
      const search = bookingFilters.search.toLowerCase()
      result = result.filter(b =>
        b.contactName.toLowerCase().includes(search) ||
        b.contactEmail.toLowerCase().includes(search) ||
        b.contactClinicName.toLowerCase().includes(search) ||
        b.uid.toLowerCase().includes(search)
      )
    }
    
    // Filter by date range
    if (bookingFilters.dateFrom) {
      result = result.filter(b => b.startAt >= bookingFilters.dateFrom!)
    }
    if (bookingFilters.dateTo) {
      result = result.filter(b => b.startAt <= bookingFilters.dateTo!)
    }
    
    return result
  }, [data, bookingFilters])

  // Paginate bookings
  const paginatedBookings = React.useMemo(() => {
    const start = (bookingPage - 1) * DEFAULT_PAGE_SIZE
    const end = start + DEFAULT_PAGE_SIZE
    return filteredBookings.slice(start, end)
  }, [filteredBookings, bookingPage])

  const bookingPagination: PaginationState = React.useMemo(() => ({
    page: bookingPage,
    pageSize: DEFAULT_PAGE_SIZE,
    total: filteredBookings.length,
    totalPages: Math.ceil(filteredBookings.length / DEFAULT_PAGE_SIZE)
  }), [filteredBookings.length, bookingPage])

  // Filter leads
  const filteredLeads = React.useMemo(() => {
    if (!data) return []
    
    let result = data.leads
    
    // Filter by status
    if (leadFilters.status && leadFilters.status !== "ALL") {
      result = result.filter(l => l.status === leadFilters.status)
    }
    
    // Filter by source
    if (leadFilters.source && leadFilters.source !== "ALL") {
      result = result.filter(l => l.source === leadFilters.source)
    }
    
    // Filter by search
    if (leadFilters.search) {
      const search = leadFilters.search.toLowerCase()
      result = result.filter(l =>
        l.contactName.toLowerCase().includes(search) ||
        l.contactEmail.toLowerCase().includes(search) ||
        l.contactClinicName.toLowerCase().includes(search) ||
        l.message.toLowerCase().includes(search)
      )
    }
    
    return result
  }, [data, leadFilters])

  // Paginate leads
  const paginatedLeads = React.useMemo(() => {
    const start = (leadPage - 1) * DEFAULT_PAGE_SIZE
    const end = start + DEFAULT_PAGE_SIZE
    return filteredLeads.slice(start, end)
  }, [filteredLeads, leadPage])

  const leadPagination: PaginationState = React.useMemo(() => ({
    page: leadPage,
    pageSize: DEFAULT_PAGE_SIZE,
    total: filteredLeads.length,
    totalPages: Math.ceil(filteredLeads.length / DEFAULT_PAGE_SIZE)
  }), [filteredLeads.length, leadPage])

  // Actions
  const regenerateData = React.useCallback((seed?: string) => {
    setIsLoading(true)
    const newData = generateDemoData(seed)
    setData(newData)
    
    // Reset pagination
    setBookingPage(1)
    setLeadPage(1)
    
    setIsLoading(false)
  }, [])

  const resetFilters = React.useCallback(() => {
    setBookingFilters({
      status: "ALL",
      search: "",
      dateFrom: undefined,
      dateTo: undefined
    })
    setLeadFilters({
      status: "ALL",
      search: "",
      source: "ALL"
    })
    setBookingPage(1)
    setLeadPage(1)
  }, [])

  const cancelBooking = React.useCallback((id: string) => {
    if (!data) return
    
    const updatedBookings = data.bookings.map(b => {
      if (b.id === id && b.status !== "CANCELLED") {
        return {
          ...b,
          status: "CANCELLED" as DemoBookingStatus,
          cancelledAt: new Date()
        }
      }
      return b
    })
    
    setData({
      ...data,
      bookings: updatedBookings
    })
  }, [data])

  const value: DemoStoreContextValue = {
    data,
    
    bookings: paginatedBookings,
    bookingFilters,
    bookingPagination,
    setBookingFilters,
    setBookingPage,
    cancelBooking,
    
    leads: paginatedLeads,
    leadFilters,
    leadPagination,
    setLeadFilters,
    setLeadPage,
    
    roiCalculations: data?.roiCalculations ?? [],
    
    regenerateData,
    resetFilters,
    
    isLoading,
    seed: data?.seed ?? null
  }

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useDemoStore() {
  const context = React.useContext(DemoStoreContext)
  if (!context) {
    throw new Error("useDemoStore must be used within DemoStoreProvider")
  }
  return context
}
