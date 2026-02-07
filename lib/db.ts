import "server-only"

import { prisma } from "@/lib/prisma"

// Back-compat alias for code that imports @/lib/db
export const db = prisma
export { prisma }
