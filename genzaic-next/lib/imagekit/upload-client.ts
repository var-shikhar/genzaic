"use client"

/**
 * Browser → ImageKit direct upload.
 *
 * The previous flow shipped the file `browser → Next.js → ImageKit`, which
 * (a) ate serverless RAM on every request, (b) burned a full execution slot
 * per upload, and (c) added a needless network hop. Direct upload removes all
 * three: the server only sees the resulting URL + fileId returned by ImageKit
 * once the upload completes.
 *
 * The auth params come from `/api/imagekit/auth` and are short-lived. Each
 * upload fetches fresh params — call sites can cache them in a ref if they
 * upload many files in quick succession (e.g. a gallery uploader).
 */

export interface ImageKitUploadResult {
  url: string
  fileId: string
  name: string
  size: number
}

interface UploadOptions {
  file: File
  folder: string
  /** Forward upload progress (0..1) to the UI. */
  onProgress?: (fraction: number) => void
  /** Caller-supplied AbortSignal — cancels the underlying XHR. */
  signal?: AbortSignal
}

interface AuthConfig {
  token: string
  expire: number
  signature: string
  publicKey: string
  uploadEndpoint: string
}

let cachedConfig: { config: AuthConfig; fetchedAt: number } | null = null
// ImageKit signatures last ~10 min by default. Cache aggressively but not to
// the edge of the window — leaves headroom for slow uploads of large files.
const AUTH_CACHE_MS = 7 * 60_000

async function getUploadConfig(): Promise<AuthConfig> {
  const now = Date.now()
  if (cachedConfig && now - cachedConfig.fetchedAt < AUTH_CACHE_MS) {
    return cachedConfig.config
  }
  const res = await fetch("/api/imagekit/auth", { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to obtain ImageKit auth (${res.status})`)
  }
  const config = (await res.json()) as AuthConfig
  cachedConfig = { config, fetchedAt: now }
  return config
}

/** Drop the cached auth params; useful after a sign-out or token-refresh. */
export function resetImageKitUploadAuth() {
  cachedConfig = null
}

export async function uploadToImageKitFromBrowser(
  opts: UploadOptions,
): Promise<ImageKitUploadResult> {
  const config = await getUploadConfig()

  const form = new FormData()
  form.append("file", opts.file)
  form.append("fileName", opts.file.name)
  form.append("folder", opts.folder)
  form.append("useUniqueFileName", "true")
  form.append("publicKey", config.publicKey)
  form.append("signature", config.signature)
  form.append("expire", String(config.expire))
  form.append("token", config.token)

  // XHR (not fetch) because fetch has no upload-progress API in browsers.
  return new Promise<ImageKitUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", config.uploadEndpoint)

    if (opts.signal) {
      if (opts.signal.aborted) {
        xhr.abort()
        reject(new DOMException("Upload aborted", "AbortError"))
        return
      }
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true })
    }

    if (opts.onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) opts.onProgress!(evt.loaded / evt.total)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText) as {
            url: string
            fileId: string
            name: string
            size: number
          }
          resolve({
            url: body.url,
            fileId: body.fileId,
            name: body.name,
            size: body.size,
          })
        } catch (err) {
          reject(err)
        }
      } else {
        // ImageKit signatures are time-bounded — a 401/403 most often means
        // ours just expired in flight. Drop the cache so the next upload
        // refetches a fresh signature.
        if (xhr.status === 401 || xhr.status === 403) {
          resetImageKitUploadAuth()
        }
        reject(
          new Error(`ImageKit upload failed (${xhr.status}): ${xhr.responseText}`),
        )
      }
    }

    xhr.onerror = () => reject(new Error("Network error during ImageKit upload"))
    xhr.onabort = () => reject(new DOMException("Upload aborted", "AbortError"))

    xhr.send(form)
  })
}

/**
 * Upload several files concurrently. Cap concurrency to avoid hammering the
 * user's uplink — 3 is a good default for product gallery / KYC pairs.
 */
export async function uploadManyToImageKitFromBrowser(
  files: File[],
  folder: string,
  concurrency = 3,
): Promise<ImageKitUploadResult[]> {
  const results: ImageKitUploadResult[] = new Array(files.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, files.length) }, async () => {
    while (true) {
      const i = cursor++
      if (i >= files.length) return
      results[i] = await uploadToImageKitFromBrowser({ file: files[i], folder })
    }
  })
  await Promise.all(workers)
  return results
}
