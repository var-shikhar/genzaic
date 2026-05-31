import ImageKit from "imagekit"
import { env } from "@/lib/env"

function getImageKitInstance() {
  return new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  })
}

let _imagekit: ImageKit | null = null

export function getImageKit() {
  if (!_imagekit) _imagekit = getImageKitInstance()
  return _imagekit
}

export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = "genzaic"
): Promise<{ url: string; fileId: string }> {
  const result = await getImageKit().upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
  })
  return { url: result.url, fileId: result.fileId }
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  await getImageKit().deleteFile(fileId)
}

export async function getImageKitAuthParams() {
  return getImageKit().getAuthenticationParameters()
}

/**
 * Everything a browser needs to upload directly to ImageKit. Returned by
 * `GET /api/imagekit/auth` so the client uploader doesn't need any other
 * round-trip. The signature/token/expire triple is short-lived and signed
 * with the private key on the server.
 */
export async function getImageKitClientUploadConfig() {
  const auth = await getImageKitAuthParams()
  return {
    ...auth,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    uploadEndpoint: "https://upload.imagekit.io/api/v1/files/upload" as const,
  }
}

export const IMAGEKIT_FOLDERS = {
  AVATARS: "/genzaic/avatars",
  PRODUCTS: "/genzaic/products",
  THUMBNAILS: "/genzaic/thumbnails",
  STOREFRONT: "/genzaic/storefront",
  KYC: "/genzaic/kyc",
} as const
