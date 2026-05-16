import "server-only"
import { createHmac } from "crypto"
import { env } from "@/lib/env"

/**
 * File-storage abstraction.
 *
 * Today everything lives on ImageKit. In a few months product files will
 * move to S3. Callers should NEVER hand a raw stored URL to a buyer —
 * always pipe it through `getSignedDownloadUrl()` so we hand out an
 * expiring, signed URL that's safe to embed in an email or 302 to.
 *
 * Adding S3 support later means swapping the implementation in here; the
 * call sites don't change.
 */

const DEFAULT_TTL_SECONDS = 5 * 60 // 5 minutes

interface SignedUrlOptions {
  /**
   * Time the URL stays valid, in seconds. Keep this small (default 5 min).
   * Anyone who copies the URL after expiry gets a 401 from the CDN.
   */
  ttlSeconds?: number
}

/**
 * Return a short-lived, signed download URL for a file that was uploaded
 * via `lib/imagekit`. Non-ImageKit URLs (e.g. a seller pasted a Google
 * Drive link as `externalUrl`) pass through unchanged — those aren't ours
 * to sign.
 */
export function getSignedDownloadUrl(
  rawUrl: string,
  options: SignedUrlOptions = {},
): string {
  if (!rawUrl) return ""

  if (isImageKitUrl(rawUrl)) {
    return signImageKitUrl(rawUrl, options.ttlSeconds ?? DEFAULT_TTL_SECONDS)
  }

  // Future: if (isS3Url(rawUrl)) return signS3Url(rawUrl, options)

  // Unknown host — return the URL as-is. The seller chose to host on a
  // platform we can't sign for; we can't help with that.
  return rawUrl
}

function isImageKitUrl(url: string): boolean {
  return url.includes("ik.imagekit.io") || url.startsWith(env.IMAGEKIT_URL_ENDPOINT)
}

/**
 * ImageKit signed-URL algorithm — see
 * https://imagekit.io/docs/url-signature.
 *
 * The signature is HMAC-SHA1 over (path + expiry-seconds), keyed with our
 * private key. ImageKit's CDN verifies it at the edge and rejects requests
 * after the expiry timestamp.
 */
function signImageKitUrl(url: string, ttlSeconds: number): string {
  const endpoint = env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "")

  // Build the path-and-query relative to the URL endpoint. ImageKit signs
  // everything that comes after the endpoint, including existing `tr=` and
  // any other query params.
  const idx = url.indexOf(endpoint)
  if (idx === -1) return url

  const relative = url.slice(idx + endpoint.length).replace(/^\//, "")
  if (!relative) return url

  const expirySeconds = Math.floor(Date.now() / 1000) + ttlSeconds
  const stringToSign = `${endpoint}/${relative}${expirySeconds}`

  const signature = createHmac("sha1", env.IMAGEKIT_PRIVATE_KEY)
    .update(stringToSign)
    .digest("hex")

  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}ik-t=${expirySeconds}&ik-s=${signature}`
}
