import "dotenv/config"

import { defineConfig } from "prisma/config"

// Prisma ORM v7:
// - The datasource URL is configured here (not in schema.prisma)
// - Use DATABASE_URL_UNPOOLED when available for CLI/migrations; fall back to DATABASE_URL
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
})
