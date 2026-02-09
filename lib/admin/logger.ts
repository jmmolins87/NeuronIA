/**
 * Structured logging for admin actions
 */

type LogLevel = "info" | "warn" | "error"

interface LogContext {
  adminId?: string
  username?: string
  action?: string
  ip?: string
  userAgent?: string
  [key: string]: unknown
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const timestamp = new Date().toISOString()
  const prefix = "[ADMIN]"
  
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  }

  const formatted = `${prefix} ${timestamp} [${level.toUpperCase()}] ${message} ${
    context ? JSON.stringify(context) : ""
  }`

  if (level === "error") {
    console.error(formatted)
  } else if (level === "warn") {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }

  return logData
}

export const adminLogger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
}
