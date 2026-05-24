import { describe, it, expect, vi } from "vitest"

// Block real lib/db (and its env validation) — worker.ts imports it eagerly.
vi.mock("@/lib/db", () => ({
  db: {},
  notifications: {},
  notificationOutbox: {},
  userDevices: {},
  users: {},
}))
vi.mock("./dispatchers/push", () => ({ dispatchPush: vi.fn() }))
vi.mock("./dispatchers/email", () => ({ dispatchEmail: vi.fn() }))

import { deriveNextStatus } from "./worker"

describe("deriveNextStatus", () => {
  it("marks 'sent' on success", () => {
    expect(deriveNextStatus({ outcome: "ok", attempts: 1 })).toMatchObject({ status: "sent" })
  })

  it("marks 'skipped' on no-recipients", () => {
    expect(deriveNextStatus({ outcome: "skip", attempts: 0 })).toMatchObject({ status: "skipped" })
  })

  it("retries on failure with backoff while under MAX_ATTEMPTS", () => {
    const r = deriveNextStatus({ outcome: "fail", attempts: 1 })
    expect(r.status).toBe("pending")
    expect(r.attempts).toBe(2)
    expect(r.nextAttemptAt!.getTime()).toBeGreaterThan(Date.now())
  })

  it("marks 'failed' after MAX_ATTEMPTS exhausted", () => {
    expect(deriveNextStatus({ outcome: "fail", attempts: 5 })).toMatchObject({ status: "failed" })
  })
})
