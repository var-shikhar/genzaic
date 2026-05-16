import { GenzaicLoader } from "@/components/ui/genzaic-loader"

// Storefronts are server-rendered with 60s ISR — most visits hit the cache and
// skip this entirely. On cold renders, regenerations, and the first hop from
// outside the cached set, Next.js shows this `loading.tsx` while the page's
// async data resolves.
//
// We use the shared full-page brand loader (same one wired into the dashboard,
// storefront editor, and KYC flows) so every wait state in the app has the
// same voice: brand wordmark + a carousel of digital-asset glyphs gliding
// through the center stage. Replaces the earlier skeleton, which read as
// "broken layout" more than "loading."
export default function StorefrontLoading() {
  return <GenzaicLoader.Page label="Opening the storefront" />
}
