/**
 * Image transformation helpers for ImageKit-hosted assets.
 *
 * Why: product cover images are uploaded at their original resolution
 * (often 2000px+). When rendered as a 80×80 thumbnail on checkout or a
 * 64×64 thumb in order summaries, the browser would otherwise download
 * the full-size source. Appending ImageKit's `tr=` query forces the CDN
 * to deliver a properly sized, format-optimised variant.
 *
 * Non-ImageKit URLs (Google avatars, etc.) pass through untouched so
 * this helper is safe to wrap any image src.
 */
export function ikThumb(
  url: string | null | undefined,
  size: number,
  quality = 75,
): string {
  if (!url) return ""
  if (!url.includes("ik.imagekit.io")) return url

  // Build the transform string. `f-auto` lets ImageKit serve WebP/AVIF
  // when the browser supports it; `c-maintain_ratio` preserves the
  // source aspect ratio inside the requested bounding box.
  const tr = `tr=w-${size},h-${size},c-maintain_ratio,q-${quality},f-auto`

  // ImageKit URLs may already carry a `?tr=...` segment if produced by
  // the upload pipeline. Replace rather than append.
  const [base, search] = url.split("?")
  if (!search) return `${base}?${tr}`

  const params = new URLSearchParams(search)
  params.delete("tr")
  const rest = params.toString()
  return rest ? `${base}?${tr}&${rest}` : `${base}?${tr}`
}

/**
 * Larger preset for hero / cover renders. Caller passes the rendered
 * pixel width; we slightly overshoot for retina displays.
 */
export function ikHero(
  url: string | null | undefined,
  width: number,
  quality = 80,
): string {
  if (!url) return ""
  if (!url.includes("ik.imagekit.io")) return url

  const w = Math.round(width * 1.5)
  const tr = `tr=w-${w},q-${quality},f-auto`

  const [base, search] = url.split("?")
  if (!search) return `${base}?${tr}`

  const params = new URLSearchParams(search)
  params.delete("tr")
  const rest = params.toString()
  return rest ? `${base}?${tr}&${rest}` : `${base}?${tr}`
}
