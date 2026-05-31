import Link from "next/link"
import { Globe, Instagram, Twitter, Youtube } from "lucide-react"
import {
  themeFor,
  pairingDisplayFont,
  PAIRING_BODY_STACK,
} from "@/lib/store/theme"
import { cn } from "@/lib/utils"
import { ClosedStoreBackdrop } from "@/components/store/ClosedStoreBackdrop"

interface ClosedStorePageProps {
  storeName: string | null
  headline: string | null
  message: string | null
  showSocials: boolean
  socials: {
    instagram: string | null
    twitter: string | null
    youtube: string | null
    website: string | null
  }
  themeId: string
  primaryColor: string
  typePairing: "house" | "press" | "studio" | "plain"
}

export function ClosedStorePage({
  storeName,
  headline,
  message,
  showSocials,
  socials,
  themeId,
  primaryColor,
  typePairing,
}: ClosedStorePageProps) {
  const t = themeFor(themeId, primaryColor)
  const displayFont = pairingDisplayFont(typePairing)
  const hasAnySocial =
    showSocials &&
    (socials.instagram || socials.twitter || socials.youtube || socials.website)

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center px-6 relative",
        t.pageBg,
      )}
      style={{
        fontFamily: PAIRING_BODY_STACK,
        ["--store-heading" as string]: `${displayFont}, Georgia, serif`,
      }}
    >
      <ClosedStoreBackdrop primaryColor={primaryColor} />
      <div className="max-w-xl w-full text-center relative z-10">
        <p
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.25em] opacity-70",
            t.subText,
          )}
        >
          {storeName ?? "Store"}
        </p>
        <h1
          className={cn(
            "mt-6 text-4xl sm:text-5xl",
            t.fontWeightHeading,
            t.heroText,
          )}
          style={{ fontFamily: "var(--store-heading)" }}
        >
          {headline ?? "This store is currently closed."}
        </h1>
        {message && (
          <p className={cn("mt-6 text-lg leading-relaxed", t.subText)}>
            {message}
          </p>
        )}
        {hasAnySocial && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {socials.instagram && (
              <a
                href={`https://instagram.com/${socials.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={`https://twitter.com/${socials.twitter.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted/40 hover:bg-muted/70 transition-colors"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
        <p className="mt-12 text-xs text-muted-foreground">
          Powered by{" "}
          <Link
            href="/"
            className="font-semibold text-primary hover:underline"
          >
            GenZaic
          </Link>
        </p>
      </div>
    </div>
  )
}
