#!/usr/bin/env node

/**
 * Bootstrap Super Admin User
 * 
 * Usage:
 *   npm run admin:bootstrap
 * 
 * Environment variables:
 *   ADMIN_BOOTSTRAP_USERNAME (default: "superadmin")
 *   ADMIN_BOOTSTRAP_PASSWORD (required, 8+ chars)
 *   ADMIN_BOOTSTRAP_EMAIL (optional)
 */

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { env } from "@/lib/env"

async function main() {
  console.log("🚀 Bootstrapping Super Admin user...")
  
  const { username, password, email } = {
    username: env.ADMIN_BOOTSTRAP_USERNAME,
    password: env.ADMIN_BOOTSTRAP_PASSWORD,
    email: env.ADMIN_BOOTSTRAP_EMAIL,
  }

  // Validate required fields
  if (!username || !password) {
    console.error("❌ Error: Missing required environment variables")
    console.error("Required:")
    console.error("  - ADMIN_BOOTSTRAP_PASSWORD (8+ characters)")
    console.error("Optional:")
    console.error("  - ADMIN_BOOTSTRAP_USERNAME (default: superadmin)")
    console.error("  - ADMIN_BOOTSTRAP_EMAIL")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("❌ Error: ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters")
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.adminUser.findUnique({
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

    if (existingUser) {
      // Update existing user
      const passwordHash = await bcrypt.hash(password, 12)
      
      const updatedUser = await prisma.adminUser.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          email,
          role: "SUPER_ADMIN",
          isActive: true,
          updatedAt: new Date(),
        }
      })

      console.log("✅ Updated existing Super Admin user:")
      console.log(`   Username: ${updatedUser.username}`)
      console.log(`   Email: ${updatedUser.email || "Not set"}`)
      console.log(`   Role: ${updatedUser.role}`)
      console.log(`   Active: ${updatedUser.isActive}`)
      
      return
    }

    // Create new super admin
    const passwordHash = await bcrypt.hash(password, 12)
    
    const superAdmin = await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
        email,
        role: "SUPER_ADMIN",
        isActive: true,
      }
    })

    console.log("✅ Created new Super Admin user:")
    console.log(`   ID: ${superAdmin.id}`)
    console.log(`   Username: ${superAdmin.username}`)
    console.log(`   Email: ${superAdmin.email || "Not set"}`)
    console.log(`   Role: ${superAdmin.role}`)
    console.log(`   Active: ${superAdmin.isActive}`)
    console.log(`   Created: ${superAdmin.createdAt.toISOString()}`)
    
  } catch (error) {
    console.error("❌ Error bootstrapping Super Admin:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Run the script
main()