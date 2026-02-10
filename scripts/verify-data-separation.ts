#!/usr/bin/env node

/**
 * Verify Data Separation
 * 
 * Ensures that SUPER_ADMIN users only see REAL data,
 * and DEMO users only see DEMO data.
 */

import { config } from "dotenv"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

config({ path: ".env.local" })

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log("🔍 Verificando separación de datos\n")

    // Get all admin users
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        mode: true,
        isActive: true,
      },
    })

    console.log("👥 Usuarios en el sistema:")
    console.log()

    for (const user of users) {
      console.log(`📋 ${user.username}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Mode: ${user.mode}`)
      console.log(`   Active: ${user.isActive}`)
      
      // Verify constraints
      if (user.role === "SUPER_ADMIN" && user.mode !== "REAL") {
        console.log(`   ⚠️  WARNING: SUPER_ADMIN en modo ${user.mode} (debería ser REAL)`)
      } else if (user.role === "SUPER_ADMIN") {
        console.log(`   ✅ Correcto: SUPER_ADMIN siempre ve datos REAL`)
      } else if (user.mode === "DEMO") {
        console.log(`   ℹ️  Este usuario ve datos DEMO (generados en cliente)`)
      } else {
        console.log(`   ℹ️  Este usuario ve datos REAL (base de datos)`)
      }
      
      console.log()
    }

    // Count real bookings in database
    const bookingCount = await prisma.booking.count()
    console.log(`📊 Reservas reales en la base de datos: ${bookingCount}`)
    console.log()

    // Summary
    console.log("📝 Resumen:")
    console.log(`   - Usuarios SUPER_ADMIN: ${users.filter(u => u.role === "SUPER_ADMIN").length}`)
    console.log(`   - Usuarios en modo REAL: ${users.filter(u => u.mode === "REAL").length}`)
    console.log(`   - Usuarios en modo DEMO: ${users.filter(u => u.mode === "DEMO").length}`)
    console.log()

    // Warnings
    const warnings = users.filter(u => u.role === "SUPER_ADMIN" && u.mode !== "REAL")
    if (warnings.length > 0) {
      console.log("⚠️  ADVERTENCIAS:")
      warnings.forEach(w => {
        console.log(`   - ${w.username} (SUPER_ADMIN) está en modo ${w.mode}`)
      })
      console.log()
      console.log("💡 Ejecuta: npm run admin:bootstrap para corregir")
    } else {
      console.log("✅ No se encontraron problemas de separación de datos")
    }

  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
