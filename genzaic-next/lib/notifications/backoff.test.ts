import { describe, it, expect } from "vitest"
import { nextAttemptDelayMs, MAX_ATTEMPTS } from "./backoff"

describe("nextAttemptDelayMs", () => {
  it("returns 1m for attempt 1", () => {
    expect(nextAttemptDelayMs(1)).toBe(60_000)
  })
  it("returns 5m for attempt 2", () => {
    expect(nextAttemptDelayMs(2)).toBe(5 * 60_000)
  })
  it("returns 15m for attempt 3", () => {
    expect(nextAttemptDelayMs(3)).toBe(15 * 60_000)
  })
  it("returns 1h for attempt 4", () => {
    expect(nextAttemptDelayMs(4)).toBe(60 * 60_000)
  })
  it("returns 6h for attempt 5", () => {
    expect(nextAttemptDelayMs(5)).toBe(6 * 60 * 60_000)
  })
  it("exposes MAX_ATTEMPTS = 5", () => {
    expect(MAX_ATTEMPTS).toBe(5)
  })
})
