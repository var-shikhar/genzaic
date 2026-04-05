import ImageKit from "imagekit"

function getImageKitInstance() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit environment variables are not configured")
  }

  return new ImageKit({ publicKey, privateKey, urlEndpoint })
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

export const IMAGEKIT_FOLDERS = {
  AVATARS: "/genzaic/avatars",
  PRODUCTS: "/genzaic/products",
  THUMBNAILS: "/genzaic/thumbnails",
  STOREFRONT: "/genzaic/storefront",
  KYC: "/genzaic/kyc",
} as const
