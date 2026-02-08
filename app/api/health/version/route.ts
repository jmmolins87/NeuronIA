import "server-only"

import { promises as fs } from "fs"
import * as path from "path"

import { okJson } from "@/lib/api/respond"

export const runtime = "nodejs"

async function readPackageVersion(): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), "package.json")
    const raw = await fs.readFile(filePath, "utf8")
    const json = JSON.parse(raw) as unknown
    if (!json || typeof json !== "object") return null
    const version = (json as { version?: unknown }).version
    return typeof version === "string" ? version : null
  } catch {
    return null
  }
}

export async function GET() {
  const version = await readPackageVersion()

  // Vercel-provided metadata (when deployed on Vercel)
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? null
  const commitRef = process.env.VERCEL_GIT_COMMIT_REF ?? null
  const vercelEnv = process.env.VERCEL_ENV ?? null
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_BUILD_ID ?? null

  return okJson(
    {
      version,
      commitSha,
      commitRef,
      vercelEnv,
      deploymentId,
      node: process.version,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  )
}
