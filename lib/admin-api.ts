/**
 * Admin API Client - Centralized fetch helper with CSRF protection
 * 
 * Features:
 * - Automatic CSRF token management
 * - Automatic X-Admin-CSRF header injection
 * - DEMO mode detection (returns mock data instead of real mutations)
 * - Consistent error handling
 * - JSON response parsing
 * 
 * Usage:
 * ```ts
 * import { adminApi } from "@/lib/admin-api"
 * 
 * // Initialize once (in provider or on page load)
 * await adminApi.init()
 * 
 * // Use in components
 * const result = await adminApi.post("/api/admin/bookings/123/cancel", {})
 * ```
 */

export interface AdminUser {
  id: string
  username: string
  email: string | null
  role: "SUPER_ADMIN" | "ADMIN"
  mode: "REAL" | "DEMO"
  isActive: boolean
}

export interface AdminSession {
  user: AdminUser
  csrfToken: string
  expiresAt: string
  expiresInDays: number
}

export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

class AdminApiClient {
  private csrfToken: string | null = null
  private user: AdminUser | null = null
  private initialized = false

  /**
   * Initialize the client by fetching current session + CSRF token
   */
  async init(): Promise<AdminSession | null> {
    try {
      const response = await fetch("/api/admin/auth/me", {
        credentials: "include",
      })

      if (!response.ok) {
        this.initialized = false
        this.csrfToken = null
        this.user = null
        return null
      }

      const data = await response.json()

      this.csrfToken = data.csrfToken
      this.user = data.user
      this.initialized = true

      return {
        user: data.user,
        csrfToken: data.csrfToken,
        expiresAt: data.session?.expiresAt,
        expiresInDays: data.session?.expiresInDays,
      }
    } catch (error) {
      console.error("[AdminAPI] Initialization failed:", error)
      this.initialized = false
      this.csrfToken = null
      this.user = null
      return null
    }
  }

  /**
   * Get current CSRF token (auto-initialize if needed)
   */
  async getCsrfToken(): Promise<string | null> {
    if (!this.initialized) {
      await this.init()
    }

    return this.csrfToken
  }

  /**
   * Get current user
   */
  getUser(): AdminUser | null {
    return this.user
  }

  /**
   * Check if user is in DEMO mode
   */
  isDemoMode(): boolean {
    return this.user?.mode === "DEMO"
  }

  /**
   * Generic request method
   */
  private async request<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Auto-initialize if not done yet
      if (!this.initialized) {
        await this.init()
      }

      // DEMO mode: Block all mutations
      if (this.isDemoMode() && options.method && options.method !== "GET") {
        console.warn("[AdminAPI] DEMO mode: Mutation blocked", { url, method: options.method })
        return {
          ok: false,
          error: "Demo mode: mutations are disabled",
          code: "DEMO_MODE_BLOCKED",
        }
      }

      // Add CSRF token for mutations (POST, PUT, PATCH, DELETE)
      const isMutation = options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (isMutation && this.csrfToken) {
        headers["X-Admin-CSRF"] = this.csrfToken
      }

      // Merge with custom headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === "string") {
            headers[key] = value
          }
        })
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || data.error || "Request failed",
          code: data.code || `HTTP_${response.status}`,
          ...data,
        }
      }

      return {
        ok: true,
        data,
        ...data,
      }
    } catch (error) {
      console.error("[AdminAPI] Request failed:", { url, error })
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error",
        code: "NETWORK_ERROR",
      }
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "GET" })
  }

  /**
   * POST request (with CSRF)
   */
  async post<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request (with CSRF)
   */
  async put<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PATCH request (with CSRF)
   */
  async patch<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request (with CSRF)
   */
  async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: "DELETE" })
  }

  /**
   * Logout (clear local state)
   */
  async logout(): Promise<void> {
    try {
      await this.post("/api/admin/auth/logout")
    } catch (error) {
      console.error("[AdminAPI] Logout failed:", error)
    } finally {
      this.csrfToken = null
      this.user = null
      this.initialized = false
    }
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient()

// Export helper functions for common operations
export const adminApiHelpers = {
  /**
   * Cancel booking
   */
  cancelBooking: async (bookingId: string) => {
    return adminApi.post(`/api/admin/bookings/${bookingId}/cancel`, {})
  },

  /**
   * Reschedule booking
   */
  rescheduleBooking: async (bookingId: string, newStartAt: string, newEndAt: string) => {
    return adminApi.post(`/api/admin/bookings/${bookingId}/reschedule`, {
      newStartAt,
      newEndAt,
    })
  },

  /**
   * Update booking
   */
  updateBooking: async (bookingId: string, updates: Record<string, unknown>) => {
    return adminApi.patch(`/api/admin/bookings/${bookingId}`, updates)
  },

  /**
   * Create user (SUPER_ADMIN only)
   */
  createUser: async (userData: { username: string; password: string; email?: string; role: string }) => {
    return adminApi.post("/api/admin/users", userData)
  },

  /**
   * Update user (SUPER_ADMIN only)
   */
  updateUser: async (userId: string, updates: Record<string, unknown>) => {
    return adminApi.put(`/api/admin/users/${userId}`, updates)
  },

  /**
   * Delete user (SUPER_ADMIN only)
   */
  deleteUser: async (userId: string) => {
    return adminApi.delete(`/api/admin/users/${userId}`)
  },
}
