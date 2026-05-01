# A3 — Product CRUD Overhaul

**Date:** 2026-04-30
**Status:** Approved (design)
**Phase:** A3 (after A1 state migration + A2 cross-cutting UX)

## 1. Goal

Make creating and managing products fast and complete:
- A creator can publish a product in seconds via a quick-add modal (minimum required fields).
- Once created, the user lands on the full editor where they fill in everything else (description, gallery, contact, category, tags) at their own pace.
- The full editor supports a gallery, categories, and tags, but drops user-facing SEO fields.
- A user-level setting controls whether new products are active (visible in the store) by default; this is overridable per product.

## 2. Decisions Reference

| # | Decision |
|---|---|
| Q1 | Two-mode UX: minimal modal for create, full page editor for completion + future edits. |
| Q2 | Drag-and-drop multi-image gallery, persisted via the existing `productImages` table. |
| Q3 | Default lives on `users.default_product_active`. ProductForm uses it as initial `isActive`; per-product override via the existing Active switch. |
| Q4 | Remove SEO Title and SEO Keywords fields from the form. Add Category (hierarchical, single) and Tags (flat, multi, create-on-the-fly). SEO meta tags on the public product page are auto-generated from `title` + `description` + tag names. |
| Q5/Q6 | "Add Product" button on `/dashboard/products` opens a **QuickAdd modal** with the minimum required set. Submit creates the product → redirect to `/dashboard/products/[id]/edit`. The standalone `/dashboard/products/new` page is removed. |
| Q7 | Categories are seeded with a curated starter set; tags start empty and grow organically. |

## 3. Database Changes

### 3.1 `users` table
Add column:
```ts
defaultProductActive: boolean("default_product_active").notNull().default(true)
```
Used as the initial value for `Product.isActive` on quick-add. Per-product Active switch overrides it.

### 3.2 Seed data
Drizzle seed (`lib/db/seed.ts`) gets a starter set of ~12 categories with two-level hierarchy. Examples:
- Design (parent)
  - Templates
  - Mockups
  - Icons
- Productivity (parent)
  - Notion Templates
  - Notion Workspaces
- Education
  - Courses
  - Ebooks
- Audio
  - Music Loops
  - Sound Effects
- Code
  - Starter Kits
  - UI Kits

(Final list in the seed file — agent picks 10–15 high-coverage ones.) Tags table stays empty; new tags are created the first time a user types one.

## 4. API Changes

### 4.1 `GET /api/categories`
Returns all active categories sorted by `sortOrder`, including each row's `parentId` so the client can build the tree.

### 4.2 `GET /api/tags?search=<q>`
Returns up to 20 tags whose `name` includes `q` (case-insensitive). If `q` is empty, returns the 20 most-used tags. Used by the tag combobox autocomplete.

### 4.3 Modify `POST /api/products` and `PUT /api/products/[id]`
Accept new payload fields (already in `productSchema`):
- `categoryId` (uuid, optional)
- `tagIds` (array of uuid, optional)
- `tagNames` (array of strings, optional) — for new tags created on the fly. Server creates any missing tags by `name` (slug auto-generated), gets their ids, and merges with `tagIds` before writing the join rows.
- `galleryImages[]` (FormData files; sort order = field order)
- `removedGalleryImageIds[]` (uuids of existing gallery images to delete)

Galleries:
- New images uploaded to ImageKit at `/genzaic/products/gallery/`.
- Insert rows into `productImages` with `sortOrder` matching the upload order.
- Removed images: delete from `productImages` and from ImageKit (using `imageFileId`).

### 4.4 Drop SEO from product write paths
Server still accepts `seoTitle` / `seoKeywords` for backward compatibility (column stays, nullable) but the new form does not send them. Public product page does **not** read them anymore — see §5.5.

### 4.5 Modify `GET /api/user/profile` and `PUT /api/user/profile`
Add `defaultProductActive` to the response and to the FormData accepted by PUT. Settings toggle on the dashboard saves through this endpoint.

## 5. UI Changes

### 5.1 Products list (`app/(dashboard)/dashboard/products/page.tsx`)
- Replace `<Link href="/dashboard/products/new">` with a `<Button>` that opens `<QuickAddProductModal>`.
- After successful create, the modal navigates to `/dashboard/products/[id]/edit`.
- Delete button continues to use `useConfirm()` from A2.

### 5.2 New: `QuickAddProductModal`
Path: `components/dashboard/QuickAddProductModal.tsx`.
Built on `<Dialog>`. Fields:
- Title *
- Price * (₹)
- Thumbnail * (single image upload)
- Delivery type * (download / external_link / manual) — uses existing `<DeliveryTypeSelector>`
- Conditional required field per delivery type:
  - download: Product File *
  - external_link: External URL *
  - manual: at least one of contact email / phone / WhatsApp *

Submit button: "Create & Continue".
On submit: builds `FormData`, calls `useCreateProduct`, on success closes modal and `router.push("/dashboard/products/" + created.id + "/edit")`.

The modal initializes `isActive` from `useProfile().data.defaultProductActive` (Q3) — but doesn't surface the toggle. The Active switch is in the full editor.

### 5.3 Full editor (`components/dashboard/ProductForm.tsx`)
Rewritten to:
- Drop fields: `seoTitle`, `seoKeywords`.
- Add fields:
  - `categoryId` — `<CategoryPicker>` showing a tree dropdown.
  - Tags — `<TagsCombobox>` multi-select with autocomplete + create-new.
  - Gallery — `<GalleryUploader>` (drag-and-drop, reorderable, delete-able).
- Wrap optional fields in a `<details>`-style "More options" disclosure (open by default when editing existing product, collapsed when initial-completion arrives from modal).
- Initial value of `isActive` for new-product completion is provided by the API (the just-created product already has it set). For pure-edit it's the existing value.

### 5.4 Settings page (`app/(dashboard)/dashboard/settings/page.tsx`)
Add a new card after Profile, before Platform Fee Settings:
- Title: "Product defaults"
- Toggle: "Automatically add new products to my store" → bound to `defaultProductActive`.
- On change, call `useUpdateProfile` with FormData containing `defaultProductActive`.

### 5.5 Public product page (`app/store/[storeUrl]/product/[productId]/page.tsx`)
Replace any reads of `product.seoTitle` / `product.seoKeywords` in the page metadata with auto-generated values:
```tsx
export async function generateMetadata({ params }) {
  const product = await getPublicProduct(...)
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    keywords: product.tags?.map(t => t.name).join(", "),
  }
}
```
This page is server-rendered, so the metadata is generated at request time and the existing data loader `lib/data/public-storefront.ts` (or its product equivalent) needs to include tag names in its return.

## 6. New Components

| Component | Path | Purpose |
|---|---|---|
| `<QuickAddProductModal>` | `components/dashboard/QuickAddProductModal.tsx` | Minimal create flow. |
| `<CategoryPicker>` | `components/dashboard/CategoryPicker.tsx` | Hierarchical single-select. |
| `<TagsCombobox>` | `components/dashboard/TagsCombobox.tsx` | Multi-select with create-new. |
| `<GalleryUploader>` | `components/dashboard/GalleryUploader.tsx` | DnD multi-image. |

Each is a small focused component. The picker uses `<Popover>` + a recursive list. The combobox uses shadcn's `<Command>` and `<Popover>`. The uploader uses HTML5 drag events (no extra dep).

## 7. New Query Hooks

Added to `lib/queries/`:
- `categories.ts` — `useCategories()` (returns `Category[]` flat with `parentId`).
- `tags.ts` — `useTagsSearch(q: string)` (debounced search) + `useCreateTag()` (only used internally by the combobox if a label has no existing match).

The product save path doesn't need a separate `useCreateTag()` if we let the server accept `tagNames[]` and create them transactionally (decision §4.3).

## 8. Acceptance Criteria

- A user can click "Add Product" on the products page, fill the minimum modal fields, hit submit, and land on the edit page with a published (or unpublished, depending on default) product.
- The full editor lets the user upload a thumbnail, gallery images, pick a category from a tree, add tags (existing + new), edit description and contact, all in one disclosure-aware page.
- A user toggling "Automatically add new products to my store" in Settings affects subsequent quick-adds.
- Removing the SEO Title / SEO Keywords inputs does not break public product pages — metadata now auto-derives from title + description + tags.
- Delete confirmations use `useConfirm()` from A2; this was already done in A2 and remains untouched.
- `npm run build` and `npx tsc --noEmit` pass.
- `/dashboard/products/new` route is removed (the directory `app/(dashboard)/dashboard/products/new/` is deleted).

## 9. Out of Scope

- Bulk add / CSV import.
- Variants UI (the `productVariants` table exists but is not surfaced in this spec).
- Tag merging / admin tag management.
- Category icon uploads (`categories.iconUrl` stays nullable; not surfaced).
- A4's storefront 2-pane editor.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Tag explosion (users create many overlapping tags) | Out of scope to mitigate; future admin tooling can merge. |
| Gallery upload failure mid-batch | API processes uploads sequentially; on first failure, returns error and rolls back any uploaded ImageKit files using their `fileId`. |
| Migration of existing products without `categoryId` | Column is nullable; existing products show "Uncategorized" in the picker until edited. |
| Dropping SEO inputs but keeping columns | Columns kept nullable for safety; no data loss. Columns can be removed in a future cleanup migration. |
