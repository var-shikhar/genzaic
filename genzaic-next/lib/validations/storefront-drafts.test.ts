import { describe, it, expect } from "vitest"
import {
  draftContentSchema,
  draftCreateSchema,
  closedStateSchema,
} from "./storefront"

describe("draftContentSchema", () => {
  const valid = {
    imprintName: "Studio Iris",
    imprintSlug: "studio-iris",
    imprintTagline: "Press, papers, prints.",
    imprintEditorsNote: null,
    imprintCoverPreset: "ink" as const,
    imprintTypePairing: "house" as const,
    imprintAccent: "iris" as const,
    primaryColor: "#6E37C7",
    showcase: null,
    profileImage: null,
    coverImage: null,
    socialInstagram: null,
    socialTwitter: null,
    socialYoutube: null,
    socialWebsite: null,
  }

  it("accepts a fully-formed draft", () => {
    expect(draftContentSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects an invalid slug", () => {
    const r = draftContentSchema.safeParse({ ...valid, imprintSlug: "UPPER" })
    expect(r.success).toBe(false)
  })

  it("rejects a bad hex color", () => {
    const r = draftContentSchema.safeParse({ ...valid, primaryColor: "purple" })
    expect(r.success).toBe(false)
  })

  it("rejects an editors note over 140 chars", () => {
    const r = draftContentSchema.safeParse({
      ...valid,
      imprintEditorsNote: "x".repeat(141),
    })
    expect(r.success).toBe(false)
  })
})

describe("draftCreateSchema", () => {
  it("requires a name", () => {
    const r = draftCreateSchema.safeParse({ seedFromLive: true })
    expect(r.success).toBe(false)
  })

  it("defaults seedFromLive to false", () => {
    const r = draftCreateSchema.safeParse({ name: "draft 1" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.seedFromLive).toBe(false)
  })
})

describe("closedStateSchema", () => {
  it("accepts every-field-set", () => {
    const r = closedStateSchema.safeParse({
      closedHeadline: "Be right back",
      closedMessage: "Restocking — back next week.",
      closedShowSocials: false,
    })
    expect(r.success).toBe(true)
  })

  it("accepts nulls to clear", () => {
    const r = closedStateSchema.safeParse({
      closedHeadline: null,
      closedMessage: null,
    })
    expect(r.success).toBe(true)
  })

  it("rejects a headline over 120 chars", () => {
    const r = closedStateSchema.safeParse({ closedHeadline: "x".repeat(121) })
    expect(r.success).toBe(false)
  })
})
