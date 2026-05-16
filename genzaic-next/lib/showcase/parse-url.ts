import type { ParsedShowcaseUrl, ShowcaseKind } from "./types"

const YT_VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/
const IG_SHORTCODE_RE = /^[A-Za-z0-9_-]{1,20}$/

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
])

const IG_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
])

/**
 * Parse any reasonable YouTube or Instagram URL into a canonical
 * { platform, kind, externalId, normalizedUrl, embedUrl } shape.
 *
 * Returns null for anything we don't recognize. Pure function, browser-safe.
 */
export function parseShowcaseUrl(input: string): ParsedShowcaseUrl | null {
  if (typeof input !== "string") return null
  const trimmed = input.trim()
  if (trimmed === "") return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null

  const host = url.hostname.toLowerCase()

  if (YT_HOSTS.has(host)) return parseYouTube(url, host)
  if (IG_HOSTS.has(host)) return parseInstagram(url)
  return null
}

function parseYouTube(url: URL, host: string): ParsedShowcaseUrl | null {
  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\/+/, "").split("/")[0]
    return makeYouTubeResult(id, "video")
  }

  const path = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")
  const segments = path.split("/")

  // youtube.com/watch?v=<id>
  if (segments[0] === "watch") {
    const id = url.searchParams.get("v") ?? ""
    return makeYouTubeResult(id, "video")
  }

  // youtube.com/embed/<id>
  if (segments[0] === "embed" && segments[1]) {
    return makeYouTubeResult(segments[1], "video")
  }

  // youtube.com/shorts/<id>
  if (segments[0] === "shorts" && segments[1]) {
    return makeYouTubeResult(segments[1], "short")
  }

  return null
}

function makeYouTubeResult(
  id: string,
  kind: ShowcaseKind,
): ParsedShowcaseUrl | null {
  if (!YT_VIDEO_ID_RE.test(id)) return null
  const normalizedUrl =
    kind === "short"
      ? `https://www.youtube.com/shorts/${id}`
      : `https://www.youtube.com/watch?v=${id}`
  return {
    platform: "youtube",
    kind,
    externalId: id,
    normalizedUrl,
    embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
  }
}

function parseInstagram(url: URL): ParsedShowcaseUrl | null {
  const path = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")
  const [segment, code] = path.split("/")

  let kind: ShowcaseKind | null = null
  if (segment === "p") kind = "post"
  else if (segment === "reel" || segment === "reels") kind = "reel"
  else if (segment === "tv") kind = "tv"

  if (!kind || !code) return null
  if (!IG_SHORTCODE_RE.test(code)) return null

  const normalizedSegment = kind === "post" ? "p" : kind
  const normalizedUrl = `https://www.instagram.com/${normalizedSegment}/${code}/`

  return {
    platform: "instagram",
    kind,
    externalId: code,
    normalizedUrl,
    embedUrl: `https://www.instagram.com/${normalizedSegment}/${code}/embed/`,
  }
}
