import { describe, it, expect } from "vitest"
import { parseShowcaseUrl } from "./parse-url"

describe("parseShowcaseUrl — YouTube", () => {
  it("parses standard watch URL", () => {
    const r = parseShowcaseUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    expect(r).toEqual({
      platform: "youtube",
      kind: "video",
      externalId: "dQw4w9WgXcQ",
      normalizedUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    })
  })

  it("strips extra params from watch URL", () => {
    const r = parseShowcaseUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLabc&si=xyz",
    )
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
    expect(r?.normalizedUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  })

  it("parses youtu.be short URL", () => {
    const r = parseShowcaseUrl("https://youtu.be/dQw4w9WgXcQ")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
    expect(r?.platform).toBe("youtube")
    expect(r?.kind).toBe("video")
  })

  it("parses youtu.be with query string", () => {
    const r = parseShowcaseUrl("https://youtu.be/dQw4w9WgXcQ?si=abc123")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
  })

  it("parses /embed/ URL", () => {
    const r = parseShowcaseUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
    expect(r?.kind).toBe("video")
  })

  it("parses /embed/ URL with params", () => {
    const r = parseShowcaseUrl("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
  })

  it("parses /shorts/ URL as kind=short", () => {
    const r = parseShowcaseUrl("https://www.youtube.com/shorts/abc12345XYZ")
    expect(r?.kind).toBe("short")
    expect(r?.externalId).toBe("abc12345XYZ")
    expect(r?.normalizedUrl).toBe("https://www.youtube.com/shorts/abc12345XYZ")
  })

  it("parses m.youtube.com watch URL", () => {
    const r = parseShowcaseUrl("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
  })

  it("parses music.youtube.com watch URL", () => {
    const r = parseShowcaseUrl("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
  })

  it("upgrades http:// to https:// in normalized output", () => {
    const r = parseShowcaseUrl("http://youtube.com/watch?v=dQw4w9WgXcQ")
    expect(r?.normalizedUrl.startsWith("https://")).toBe(true)
  })

  it("rejects channel URL", () => {
    expect(parseShowcaseUrl("https://www.youtube.com/@SomeChannel")).toBeNull()
    expect(parseShowcaseUrl("https://www.youtube.com/c/SomeChannel")).toBeNull()
    expect(parseShowcaseUrl("https://www.youtube.com/channel/UCabc123")).toBeNull()
    expect(parseShowcaseUrl("https://www.youtube.com/user/somebody")).toBeNull()
  })

  it("rejects playlist URL without a video param", () => {
    expect(parseShowcaseUrl("https://www.youtube.com/playlist?list=PLabc")).toBeNull()
  })

  it("rejects youtube homepage", () => {
    expect(parseShowcaseUrl("https://www.youtube.com/")).toBeNull()
  })

  it("rejects malformed videoId (wrong length)", () => {
    expect(parseShowcaseUrl("https://www.youtube.com/watch?v=tooShort")).toBeNull()
    expect(parseShowcaseUrl("https://youtu.be/way_too_long_to_be_a_video_id")).toBeNull()
  })
})

describe("parseShowcaseUrl — Instagram", () => {
  it("parses post URL with trailing slash", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/p/CXXXXXXXX/")
    expect(r).toEqual({
      platform: "instagram",
      kind: "post",
      externalId: "CXXXXXXXX",
      normalizedUrl: "https://www.instagram.com/p/CXXXXXXXX/",
      embedUrl: "https://www.instagram.com/p/CXXXXXXXX/embed/",
    })
  })

  it("parses post URL without trailing slash", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/p/CXXXXXXXX")
    expect(r?.externalId).toBe("CXXXXXXXX")
    expect(r?.normalizedUrl.endsWith("/")).toBe(true)
  })

  it("strips ?igsh= and other params", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/p/CXXXXXXXX/?igsh=abcdef&utm_source=x")
    expect(r?.normalizedUrl).toBe("https://www.instagram.com/p/CXXXXXXXX/")
  })

  it("parses reel URL", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/reel/CYYYYYYYY/")
    expect(r?.kind).toBe("reel")
    expect(r?.externalId).toBe("CYYYYYYYY")
  })

  it("parses /reels/ plural alias as reel", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/reels/CYYYYYYYY/")
    expect(r?.kind).toBe("reel")
    expect(r?.normalizedUrl).toBe("https://www.instagram.com/reel/CYYYYYYYY/")
  })

  it("parses IGTV URL", () => {
    const r = parseShowcaseUrl("https://www.instagram.com/tv/CZZZZZZZZ/")
    expect(r?.kind).toBe("tv")
  })

  it("handles instagram.com without www", () => {
    const r = parseShowcaseUrl("https://instagram.com/p/CXXXXXXXX/")
    expect(r?.externalId).toBe("CXXXXXXXX")
    expect(r?.normalizedUrl).toBe("https://www.instagram.com/p/CXXXXXXXX/")
  })

  it("handles m.instagram.com", () => {
    const r = parseShowcaseUrl("https://m.instagram.com/p/CXXXXXXXX/")
    expect(r?.externalId).toBe("CXXXXXXXX")
  })

  it("rejects profile URL", () => {
    expect(parseShowcaseUrl("https://www.instagram.com/someuser/")).toBeNull()
  })

  it("rejects stories URL", () => {
    expect(parseShowcaseUrl("https://www.instagram.com/stories/someuser/12345/")).toBeNull()
  })

  it("rejects explore URL", () => {
    expect(parseShowcaseUrl("https://www.instagram.com/explore/")).toBeNull()
  })
})

describe("parseShowcaseUrl — edge cases", () => {
  it("returns null for empty string", () => {
    expect(parseShowcaseUrl("")).toBeNull()
  })

  it("returns null for whitespace-only string", () => {
    expect(parseShowcaseUrl("   ")).toBeNull()
  })

  it("trims surrounding whitespace before parsing", () => {
    const r = parseShowcaseUrl("  https://youtu.be/dQw4w9WgXcQ  ")
    expect(r?.externalId).toBe("dQw4w9WgXcQ")
  })

  it("returns null for unknown domain", () => {
    expect(parseShowcaseUrl("https://vimeo.com/12345")).toBeNull()
    expect(parseShowcaseUrl("https://tiktok.com/@user/video/123")).toBeNull()
  })

  it("returns null for non-http(s) schemes", () => {
    expect(parseShowcaseUrl("javascript:alert(1)")).toBeNull()
    expect(parseShowcaseUrl("mailto:foo@bar.com")).toBeNull()
    expect(parseShowcaseUrl("data:text/html,<script>")).toBeNull()
  })

  it("returns null for garbage strings", () => {
    expect(parseShowcaseUrl("not a url")).toBeNull()
    expect(parseShowcaseUrl("youtube")).toBeNull()
  })
})
