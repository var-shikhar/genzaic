import { describe, it, expect, vi, beforeEach } from "vitest"

const { sendGeneric } = vi.hoisted(() => ({
  sendGeneric: vi.fn().mockResolvedValue({ data: { id: "msg1" } }),
}))

vi.mock("@/lib/email/notifications", () => ({
  sendGenericNotificationEmail: sendGeneric,
}))

// Block the real lib/db import (and its transitive env validation) — we don't need it.
vi.mock("@/lib/db", () => ({}))

import { dispatchEmail } from "./email"

const user = { email: "test@example.com", name: "Tester" } as { email: string; name: string }

describe("dispatchEmail", () => {
  beforeEach(() => sendGeneric.mockClear())

  it("sends the generic email for any type the worker processes", async () => {
    await dispatchEmail(
      {
        id: "n1",
        type: "new_follower",
        title: "Someone followed you",
        message: "Cool, huh?",
        link: "/profile",
      } as never,
      user as never,
    )
    expect(sendGeneric).toHaveBeenCalledOnce()
    expect(sendGeneric.mock.calls[0][0]).toMatchObject({
      toEmail: "test@example.com",
      toName: "Tester",
      notification: { title: "Someone followed you", message: "Cool, huh?", link: "/profile" },
    })
  })

  it("falls back to email-prefix when user.name is missing", async () => {
    await dispatchEmail(
      { id: "n1", type: "system", title: "t", message: "m" } as never,
      { email: "alice@example.com", name: null } as never,
    )
    expect(sendGeneric.mock.calls[0][0].toName).toBe("alice")
  })
})
