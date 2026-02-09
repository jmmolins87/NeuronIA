/**
 * Admin V2 Security Constants
 */

export const ADMIN_SECURITY = {
  // Rate limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  },

  // Account lockout
  LOCKOUT: {
    MAX_FAILED_ATTEMPTS: 10,
    FAILED_ATTEMPTS_WINDOW_HOURS: 24,
    LOCKOUT_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  },

  // Session management
  SESSION: {
    TTL_DAYS_DEFAULT: 7,
    SLIDING_THRESHOLD_MS: 24 * 60 * 60 * 1000, // 24 hours
    COOKIE_NAME: "clinvetia_admin_session",
  },

  // Error messages (neutral, don't reveal user existence)
  ERRORS: {
    INVALID_CREDENTIALS: "Invalid credentials",
    ACCOUNT_LOCKED: "Account temporarily locked. Please try again later.",
    RATE_LIMITED: "Too many login attempts. Please try again later.",
    SESSION_EXPIRED: "Session expired. Please login again.",
    CSRF_INVALID: "Invalid request token. Please refresh and try again.",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
  },

  // Audit action types
  AUDIT: {
    BOOKING: {
      CANCEL: "BOOKING_CANCEL",
      RESCHEDULE: "BOOKING_RESCHEDULE",
      EDIT: "BOOKING_EDIT",
      EDIT_CONTACT: "BOOKING_EDIT_CONTACT",
      EDIT_ROI: "BOOKING_EDIT_ROI",
      VIEW: "BOOKING_VIEW",
    },
    USER: {
      CREATE: "USER_CREATE",
      UPDATE: "USER_UPDATE",
      DISABLE: "USER_DISABLE",
      ENABLE: "USER_ENABLE",
      DELETE: "USER_DELETE",
      RESET_PASSWORD: "USER_RESET_PASSWORD",
      DEMO_LOGIN: "DEMO_LOGIN",
      LOGIN_SUCCESS: "LOGIN_SUCCESS",
      LOGIN_FAILED: "LOGIN_FAILED",
      LOGOUT: "LOGOUT",
    },
  },
} as const
