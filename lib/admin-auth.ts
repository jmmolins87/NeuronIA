import "server-only"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { prisma } from "./prisma"

// Types
export interface AdminSession {
  userId: string
  username: string
  role: "SUPER_ADMIN" | "ADMIN"
  isActive: boolean
}

export interface AdminAuthResult {
  success: boolean
  user?: AdminSession
  error?: string
}

// Constants
const SESSION_EXPIRY = 30 * 60 // 30 minutes for security
const COOKIE_OPTIONS = {
  name: env.ADMIN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_EXPIRY,
  expires: new Date(Date.now() + SESSION_EXPIRY * 1000),
}

// JWT functions
async function signJWT(payload: AdminSession): Promise<string> {
  const secret = new TextEncoder().encode(env.ADMIN_SESSION_SECRET)
  
  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_EXPIRY)
    .sign(secret)
}

async function verifyJWT(token: string): Promise<AdminSession | null> {
  try {
    const secret = new TextEncoder().encode(env.ADMIN_SESSION_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

// Authentication functions
export async function authenticateAdmin(username: string, password: string): Promise<AdminAuthResult> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      },
    })

    if (!admin) {
      return { success: false, error: "Invalid credentials" }
    }

    if (!admin.isActive) {
      return { success: false, error: "Account disabled" }
    }

    // Import bcrypt dynamically to avoid server-only issues
    const { default: bcrypt } = await import("bcryptjs")
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    const session: AdminSession = {
      userId: admin.id,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
    }

    return { success: true, user: session }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function getCurrentAdmin(request?: NextRequest): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = request 
      ? request.cookies.get(env.ADMIN_COOKIE_NAME)?.value
      : cookieStore.get(env.ADMIN_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const session = await verifyJWT(token)
    if (!session) {
      return null
    }

    // Verify user is still active in DB
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: { isActive: true, role: true },
    })

    if (!admin || !admin.isActive) {
      return null
    }

    return { ...session, isActive: admin.isActive, role: admin.role }
  } catch {
    return null
  }
}

export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | null> {
  return getCurrentAdmin(request)
}

export async function createAdminSession(session: AdminSession): Promise<void> {
  const token = await signJWT(session)
  const cookieStore = await cookies()
  
  cookieStore.set(env.ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS)
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(env.ADMIN_COOKIE_NAME)
}

// Middleware helper
export function adminAuthMiddleware(request: NextRequest) {
  const session = getCurrentAdmin(request)
  
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
  
  return null
}

// Role-based access control
export function canAccessUsers(role: string): boolean {
  return role === "SUPER_ADMIN"
}

export function canAccessAllBookings(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN"
}

export function requireSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === "SUPER_ADMIN"
}

export function requireAdmin(session: AdminSession | null): boolean {
  return Boolean(session && (session.role === "SUPER_ADMIN" || session.role === "ADMIN"))
}