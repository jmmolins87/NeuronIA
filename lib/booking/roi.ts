import "server-only"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function isRoiValid(roiData: unknown): boolean {
  if (!isRecord(roiData)) return false
  const keys = Object.keys(roiData)
  if (keys.length === 0) return false

  // Explicit completion flag (frontend may set this).
  if (roiData.roiCompleted === true) return true

  // Generic robust check: at least one numeric value > 0 anywhere in the object.
  const stack: unknown[] = [roiData]
  const visited = new Set<unknown>()

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    if (visited.has(current)) continue
    visited.add(current)

    if (typeof current === "number" && Number.isFinite(current) && current > 0) return true

    if (Array.isArray(current)) {
      for (const v of current) stack.push(v)
      continue
    }

    if (isRecord(current)) {
      for (const v of Object.values(current)) stack.push(v)
    }
  }

  return false
}
