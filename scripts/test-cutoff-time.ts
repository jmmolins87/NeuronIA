#!/usr/bin/env node

/**
 * Test script for 19:00 same-day booking cutoff
 * 
 * Tests the logic that blocks same-day bookings after 19:00
 */

import { assertSameDayBookingAllowed, formatZonedYYYYMMDD } from "../lib/booking/time"

const TIMEZONE = "Europe/Madrid"

function simulateTime(hour: number, minute: number = 0): Date {
  const now = new Date()
  const madrid = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }))
  madrid.setHours(hour, minute, 0, 0)
  return new Date(now.getTime() + (madrid.getTime() - new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE })).getTime()))
}

function testCase(description: string, testFn: () => void) {
  try {
    testFn()
    console.log(`✅ ${description}`)
  } catch (error) {
    if (error instanceof Error) {
      console.log(`❌ ${description}`)
      console.log(`   Error: ${error.message}`)
    }
  }
}

console.log("🧪 Testing 19:00 same-day booking cutoff\n")

// Test 1: Before 19:00 - should allow same-day booking
testCase("18:59 - Should allow same-day booking", () => {
  const now = simulateTime(18, 59)
  const today = formatZonedYYYYMMDD(now, TIMEZONE)
  assertSameDayBookingAllowed(today, now, TIMEZONE)
})

// Test 2: At 19:00 - should block same-day booking
testCase("19:00 - Should block same-day booking", () => {
  const now = simulateTime(19, 0)
  const today = formatZonedYYYYMMDD(now, TIMEZONE)
  try {
    assertSameDayBookingAllowed(today, now, TIMEZONE)
    throw new Error("Expected to throw but didn't")
  } catch (error) {
    if (error instanceof Error && error.message.includes("after 19:00")) {
      // Expected error
      return
    }
    throw error
  }
})

// Test 3: After 19:00 - should block same-day booking
testCase("20:30 - Should block same-day booking", () => {
  const now = simulateTime(20, 30)
  const today = formatZonedYYYYMMDD(now, TIMEZONE)
  try {
    assertSameDayBookingAllowed(today, now, TIMEZONE)
    throw new Error("Expected to throw but didn't")
  } catch (error) {
    if (error instanceof Error && error.message.includes("after 19:00")) {
      // Expected error
      return
    }
    throw error
  }
})

// Test 4: Future date at 19:00+ - should allow booking for future date
testCase("19:30 but booking for tomorrow - Should allow", () => {
  const now = simulateTime(19, 30)
  const today = formatZonedYYYYMMDD(now, TIMEZONE)
  const [y, m, d] = today.split("-").map(Number)
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1))
  const tomorrowStr = formatZonedYYYYMMDD(tomorrow, TIMEZONE)
  assertSameDayBookingAllowed(tomorrowStr, now, TIMEZONE)
})

// Test 5: Morning time - should allow same-day booking
testCase("09:00 - Should allow same-day booking", () => {
  const now = simulateTime(9, 0)
  const today = formatZonedYYYYMMDD(now, TIMEZONE)
  assertSameDayBookingAllowed(today, now, TIMEZONE)
})

console.log("\n✨ Test suite complete!")
