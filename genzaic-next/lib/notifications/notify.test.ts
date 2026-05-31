import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the db module — we test the logic of notifyEvent without hitting Postgres.
const {
  insertReturning,
  insertNotificationsValues,
  insertOutboxValues,
  insertPrefsValues,
  insert,
  select,
  transaction,
} = vi.hoisted(() => {
  const insertReturning = vi.fn()
  const insertNotificationsValues = vi.fn(() => ({ returning: insertReturning }))
  const insertOutboxValues = vi.fn()
  const insertPrefsValues = vi.fn(() => ({
    returning: () =>
      Promise.resolve([{ inAppEnabled: true, emailEnabled: true }]),
  }))

  const insert = vi.fn((table: { _: { name: string } }) => {
    const name = table._?.name
    if (name === "notifications") return { values: insertNotificationsValues }
    if (name === "notification_outbox") return { values: insertOutboxValues }
    if (name === "notification_preferences") return { values: insertPrefsValues }
    return { values: vi.fn() }
  })

  const select = vi.fn(() => ({
    from: () => ({
      where: () => ({ limit: () => Promise.resolve([]) }),
    }),
  }))

  const transaction = vi.fn((cb: (tx: unknown) => Promise<unknown>) =>
    cb({ insert, select }),
  )

  return {
    insertReturning,
    insertNotificationsValues,
    insertOutboxValues,
    insertPrefsValues,
    insert,
    select,
    transaction,
  }
})

vi.mock("@/lib/db", () => ({
  db: { transaction, insert, select },
  notifications: { _: { name: "notifications" } },
  notificationOutbox: { _: { name: "notification_outbox" } },
  notificationPreferences: { _: { name: "notification_preferences" } },
}))

import { notifyEvent } from "./notify"

describe("notifyEvent", () => {
  beforeEach(() => {
    insertReturning.mockResolvedValue([
      { id: "notif-1", userId: "u1", type: "welcome", title: "t", message: "m" },
    ])
    insertNotificationsValues.mockClear()
    insertOutboxValues.mockClear()
  })

  it("writes a notifications row", async () => {
    await notifyEvent({ userId: "u1", type: "welcome", title: "t", message: "m" })
    expect(insertNotificationsValues).toHaveBeenCalledOnce()
  })

  it("writes both push and email outbox rows when prefs allow", async () => {
    await notifyEvent({ userId: "u1", type: "welcome", title: "t", message: "m" })
    expect(insertOutboxValues).toHaveBeenCalledOnce()
    const rows = insertOutboxValues.mock.calls[0][0] as Array<{ channel: string }>
    expect(rows.map((r) => r.channel).sort()).toEqual(["email", "push"])
  })

  it("skips email outbox row when suppress.email is true", async () => {
    await notifyEvent({
      userId: "u1",
      type: "welcome",
      title: "t",
      message: "m",
      suppress: { email: true },
    })
    const rows = insertOutboxValues.mock.calls[0][0] as Array<{ channel: string }>
    expect(rows.map((r) => r.channel)).toEqual(["push"])
  })

  it("skips push outbox row when suppress.push is true", async () => {
    await notifyEvent({
      userId: "u1",
      type: "welcome",
      title: "t",
      message: "m",
      suppress: { push: true },
    })
    const rows = insertOutboxValues.mock.calls[0][0] as Array<{ channel: string }>
    expect(rows.map((r) => r.channel)).toEqual(["email"])
  })
})
