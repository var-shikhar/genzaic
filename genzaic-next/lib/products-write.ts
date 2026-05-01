import { db, tags, productTags, productImages } from "@/lib/db"
import { eq, inArray } from "drizzle-orm"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function parseStringArray(formData: FormData, key: string): string[] {
  const values = formData.getAll(key)
  return values
    .map((v) => (typeof v === "string" ? v : ""))
    .filter((v) => v.length > 0)
}

export function parseFileArray(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((v): v is File => v instanceof File && v.size > 0)
}

// Ensure tags exist by name (creates missing rows), returns combined id list.
export async function ensureTagIds(
  existingIds: string[],
  newNames: string[],
): Promise<string[]> {
  const cleanedExisting = [...new Set(existingIds.filter((id) => id.length > 0))]
  if (newNames.length === 0) return cleanedExisting

  const cleanedNames = [...new Set(newNames.map((n) => n.trim()).filter((n) => n.length > 0))]
  if (cleanedNames.length === 0) return cleanedExisting

  // Look up any rows that already exist by slug.
  const slugs = cleanedNames.map(slugify)
  const existing = await db
    .select({ id: tags.id, slug: tags.slug })
    .from(tags)
    .where(inArray(tags.slug, slugs))

  const existingSlugSet = new Set(existing.map((t) => t.slug))
  const toCreate = cleanedNames.filter((n) => !existingSlugSet.has(slugify(n)))

  let createdIds: string[] = []
  if (toCreate.length > 0) {
    const inserted = await db
      .insert(tags)
      .values(toCreate.map((name) => ({ name, slug: slugify(name) })))
      .onConflictDoNothing({ target: tags.slug })
      .returning({ id: tags.id, slug: tags.slug })

    // Anything that conflicted (race) needs a second lookup by slug.
    if (inserted.length !== toCreate.length) {
      const insertedSlugs = new Set(inserted.map((r) => r.slug))
      const missing = toCreate.filter((n) => !insertedSlugs.has(slugify(n))).map(slugify)
      if (missing.length > 0) {
        const refound = await db
          .select({ id: tags.id })
          .from(tags)
          .where(inArray(tags.slug, missing))
        createdIds = [...inserted.map((r) => r.id), ...refound.map((r) => r.id)]
      } else {
        createdIds = inserted.map((r) => r.id)
      }
    } else {
      createdIds = inserted.map((r) => r.id)
    }
  }

  return [...new Set([...cleanedExisting, ...existing.map((t) => t.id), ...createdIds])]
}

export async function setProductTags(productId: string, tagIds: string[]) {
  await db.delete(productTags).where(eq(productTags.productId, productId))
  if (tagIds.length === 0) return
  await db
    .insert(productTags)
    .values(tagIds.map((tagId) => ({ productId, tagId })))
    .onConflictDoNothing()
}

export async function addGalleryImages(productId: string, files: File[]) {
  if (files.length === 0) return
  // Find current max sortOrder so we append at the end.
  const existing = await db
    .select({ sortOrder: productImages.sortOrder })
    .from(productImages)
    .where(eq(productImages.productId, productId))
  const maxOrder = existing.reduce((acc, row) => Math.max(acc, row.sortOrder), -1)

  let order = maxOrder + 1
  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadToImageKit(buf, file.name, IMAGEKIT_FOLDERS.PRODUCTS)
    await db.insert(productImages).values({
      productId,
      imageUrl: uploaded.url,
      imageFileId: uploaded.fileId,
      sortOrder: order++,
    })
  }
}

export async function removeGalleryImages(productId: string, imageIds: string[]) {
  if (imageIds.length === 0) return
  const rows = await db
    .select({ id: productImages.id, fileId: productImages.imageFileId })
    .from(productImages)
    .where(inArray(productImages.id, imageIds))

  for (const row of rows) {
    if (row.fileId) {
      await deleteFromImageKit(row.fileId).catch(() => {})
    }
  }
  await db.delete(productImages).where(inArray(productImages.id, imageIds))
}
