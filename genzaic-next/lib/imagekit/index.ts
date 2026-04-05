import ImageKit from "imagekit"

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
})

export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = "genzaic"
): Promise<{ url: string; fileId: string }> {
  const result = await imagekit.upload({
    file,
    fileName,
    folder,
    useUniqueFileName: true,
  })
  return { url: result.url, fileId: result.fileId }
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  await imagekit.deleteFile(fileId)
}

export async function getImageKitAuthParams() {
  return imagekit.getAuthenticationParameters()
}

export const IMAGEKIT_FOLDERS = {
  AVATARS: "/genzaic/avatars",
  PRODUCTS: "/genzaic/products",
  THUMBNAILS: "/genzaic/thumbnails",
  STOREFRONT: "/genzaic/storefront",
  KYC: "/genzaic/kyc",
} as const
