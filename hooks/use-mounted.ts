"use client"

import { useSyncExternalStore } from "react"

let hasMounted = false
let isInitialized = false
const listeners = new Set<() => void>()

function initMountedStore() {
  if (isInitialized) return
  isInitialized = true
  if (typeof window === "undefined") return

  queueMicrotask(() => {
    hasMounted = true
    for (const listener of listeners) listener()
    listeners.clear()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  initMountedStore()
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return hasMounted
}

function getServerSnapshot() {
  return false
}

export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
