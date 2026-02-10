"use client"

/**
 * Unified Admin Data Hook
 * 
 * Automatically switches between DEMO store (mock data) and REAL API
 * based on user's mode. Provides a consistent interface regardless of source.
 */

import { useDemoStore } from "@/lib/admin/demo-store"
import type { DemoBooking, DemoLead, DemoROICalculation } from "@/lib/admin/demo-data"

export interface UseAdminDataOptions {
  /**
   * User's mode (DEMO or REAL)
   * If DEMO, uses demo store
   * If REAL, uses API calls (not implemented yet - placeholder)
   */
  mode: "DEMO" | "REAL"
}

export interface AdminDataResult {
  // Data
  bookings: DemoBooking[]
  leads: DemoLead[]
  roiCalculations: DemoROICalculation[]
  
  // Metadata
  isDemo: boolean
  isLoading: boolean
  
  // Filters (only for DEMO, for REAL use API params)
  bookingFilters?: ReturnType<typeof useDemoStore>["bookingFilters"]
  setBookingFilters?: ReturnType<typeof useDemoStore>["setBookingFilters"]
  
  // Pagination
  bookingPagination?: ReturnType<typeof useDemoStore>["bookingPagination"]
  setBookingPage?: ReturnType<typeof useDemoStore>["setBookingPage"]
  
  // Actions
  regenerateData?: ReturnType<typeof useDemoStore>["regenerateData"]
  cancelBooking?: ReturnType<typeof useDemoStore>["cancelBooking"]
}

/**
 * Hook to get admin data (DEMO or REAL)
 * 
 * @example
 * ```tsx
 * function BookingsList({ userMode }) {
 *   const { bookings, isDemo, isLoading } = useAdminData({ mode: userMode })
 *   
 *   if (isLoading) return <Loading />
 *   
 *   return (
 *     <div>
 *       {isDemo && <DemoBadge />}
 *       {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAdminData({ mode }: UseAdminDataOptions): AdminDataResult {
  const demoStore = useDemoStore()
  
  // For now, we always use demo store
  // In the future, you can add real API calls here for REAL mode
  const isDemo = mode === "DEMO"
  
  if (isDemo) {
    // Use demo store
    return {
      bookings: demoStore.bookings,
      leads: demoStore.leads,
      roiCalculations: demoStore.roiCalculations,
      isDemo: true,
      isLoading: demoStore.isLoading,
      bookingFilters: demoStore.bookingFilters,
      setBookingFilters: demoStore.setBookingFilters,
      bookingPagination: demoStore.bookingPagination,
      setBookingPage: demoStore.setBookingPage,
      regenerateData: demoStore.regenerateData,
      cancelBooking: demoStore.cancelBooking,
    }
  } else {
    // REAL mode: Use API calls
    // TODO: Implement real API data fetching
    // For now, return empty data
    return {
      bookings: [],
      leads: [],
      roiCalculations: [],
      isDemo: false,
      isLoading: false,
      // Note: In REAL mode, filters/pagination are handled by API params
    }
  }
}
