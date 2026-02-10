#!/usr/bin/env node

import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

config({ path: ".env.local" })

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log("🔍 Diagnóstico del usuario superadmin\n")

    const username = process.env.ADMIN_BOOTSTRAP_USERNAME || "superadmin"
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || ""

    const admin = await prisma.adminUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        mode: true,
        isActive: true,
        failedLoginCount: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!admin) {
      console.log("❌ Usuario no encontrado")
      console.log(`   Buscando: ${username}`)
      return
    }

    console.log("✅ Usuario encontrado:")
    console.log(`   ID: ${admin.id}`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Email: ${admin.email || "No configurado"}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Mode: ${admin.mode}`)
    console.log(`   Active: ${admin.isActive}`)
    console.log(`   Created: ${admin.createdAt.toISOString()}`)
    console.log(`   Updated: ${admin.updatedAt.toISOString()}`)
    console.log()

    // Check password
    if (password) {
      const isValid = await bcrypt.compare(password, admin.passwordHash)
      console.log(`🔑 Password check:`)
      console.log(`   Environment password: ${password.substring(0, 5)}...`)
      console.log(`   Valid: ${isValid ? "✅ SÍ" : "❌ NO"}`)
      console.log()
    }

    // Check lockout status
    const now = new Date()
    const isLocked = admin.lockedUntil && admin.lockedUntil > now

    console.log("🔒 Estado de bloqueo:")
    console.log(`   Failed login count: ${admin.failedLoginCount}`)
    console.log(`   Last failed login: ${admin.lastFailedLoginAt?.toISOString() || "Nunca"}`)
    console.log(`   Locked until: ${admin.lockedUntil?.toISOString() || "No bloqueado"}`)
    console.log(`   Currently locked: ${isLocked ? "❌ SÍ" : "✅ NO"}`)
    console.log()

    // Last login info
    console.log("📊 Último login exitoso:")
    console.log(`   Last login: ${admin.lastLoginAt?.toISOString() || "Nunca"}`)
    console.log(`   Last IP: ${admin.lastLoginIp || "N/A"}`)
    console.log()

    // Check sessions
    const sessions = await prisma.adminSession.findMany({
      where: { adminId: admin.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    console.log(`🎫 Sesiones activas: ${sessions.length}`)
    if (sessions.length > 0) {
      sessions.forEach((s, i) => {
        const expired = s.expiresAt < now
        console.log(`   ${i + 1}. Created: ${s.createdAt.toISOString()}`)
        console.log(`      Expires: ${s.expiresAt.toISOString()} ${expired ? "(EXPIRADA)" : ""}`)
        console.log(`      IP: ${s.ipAddress || "N/A"}`)
      })
    }
    console.log()

    // If locked, offer to unlock
    if (isLocked || admin.failedLoginCount > 0) {
      console.log("🔧 Reseteando intentos fallidos y bloqueo...")
      
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginCount: 0,
          lastFailedLoginAt: null,
          lockedUntil: null,
        },
      })

      console.log("✅ Usuario desbloqueado y intentos reseteados")
    }

  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
