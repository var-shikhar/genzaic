export type ShowcasePlatform = "youtube" | "instagram"
export type ShowcaseKind = "video" | "short" | "reel" | "post" | "tv"

export interface ParsedShowcaseUrl {
  platform: ShowcasePlatform
  kind: ShowcaseKind
  externalId: string
  normalizedUrl: string
  embedUrl: string
}

export interface ShowcaseItem {
  url: string
  normalizedUrl: string
  embedUrl: string
  platform: ShowcasePlatform
  kind: ShowcaseKind
  externalId: string
  caption?: string
}

export interface StorefrontShowcase {
  title: string
  subtitle: string
  featured: ShowcaseItem | null
  items: ShowcaseItem[]
}
