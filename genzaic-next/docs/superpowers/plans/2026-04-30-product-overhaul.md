# A3 — Product CRUD Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen by user) to implement this plan task-by-task.

**Goal:** Modal-first quick-add → full editor with gallery, category, tags. Drop SEO fields. Add `users.defaultProductActive`. Seed starter categories.

**Architecture:** Drizzle migration adds the user column; seed populates categories. New API routes (`/api/categories`, `/api/tags`) plus extensions to `/api/products` (POST/PUT) for `categoryId`, `tagIds`, `tagNames`, gallery images, removed gallery image ids. New query hooks under `lib/queries/`. New components: `QuickAddProductModal`, `CategoryPicker`, `TagsCombobox`, `GalleryUploader`. ProductForm rewritten with disclosure pattern.

**No tests, no commits in this plan.**

---

## Task 1: DB schema — add `default_product_active` to users; run migration

- [ ] **Step 1.1** Modify `lib/db/schema/users.ts`: add `defaultProductActive: boolean("default_product_active").notNull().default(true)`.
- [ ] **Step 1.2** Run `npm run db:push` to apply.
- [ ] **Step 1.3** Modify `lib/db/seed.ts`: insert ~12 starter categories with two-level hierarchy (idempotent on slug). Run `npm run db:seed`.

## Task 2: API — categories + tags endpoints

- [ ] **Step 2.1** Create `app/api/categories/route.ts` with `GET` returning all `isActive` categories, ordered by sortOrder, including `parentId`.
- [ ] **Step 2.2** Create `app/api/tags/route.ts` with `GET` accepting `search` query param, returning up to 20 matches (case-insensitive name `ILIKE`).

## Task 3: API — extend products POST/PUT

- [ ] **Step 3.1** Update `app/api/products/route.ts` (POST): accept `categoryId`, `tagIds[]`, `tagNames[]`, `galleryImages` (multi-file), set `categoryId` on insert, then for tags: lookup existing by id + create-by-name (slug = `slugify(name)`), then write all `productTags` join rows. For gallery, upload each file to ImageKit `/genzaic/products/gallery/`, write `productImages` rows in upload order.
- [ ] **Step 3.2** Update `app/api/products/[id]/route.ts` (PUT): same fields + `removedGalleryImageIds[]`. Delete listed `productImages` rows + their ImageKit files. Add new uploads. Replace tag joins with the new set (delete-then-insert by id).

## Task 4: API — extend user profile for defaultProductActive

- [ ] **Step 4.1** Update `app/api/user/profile/route.ts` (GET): include `defaultProductActive` in response.
- [ ] **Step 4.2** Update PUT: accept `defaultProductActive` from FormData, persist if present.
- [ ] **Step 4.3** Update `lib/queries/user.ts`: extend `UserProfile` interface with `defaultProductActive: boolean`.

## Task 5: New query hooks

- [ ] **Step 5.1** Create `lib/queries/categories.ts` with `categoryKeys`, `useCategories()`. Re-export from `lib/queries/keys.ts`.
- [ ] **Step 5.2** Create `lib/queries/tags.ts` with `tagKeys`, `useTagsSearch(query: string)`. Re-export.
- [ ] **Step 5.3** Update `lib/queries/products.ts`: extend `Product` interface with optional `category` + `tags` + `gallery`. Add the new write paths' types (no API change to the hook signature itself — `createProduct(formData)` still takes `FormData`).

## Task 6: New components

- [ ] **Step 6.1** Create `components/dashboard/CategoryPicker.tsx`: `<Popover>` with a recursive list of categories (parents render their children indented). Single-select via clicking a leaf row (or any node). Shows currently selected node by name in the trigger button.
- [ ] **Step 6.2** Create `components/dashboard/TagsCombobox.tsx`: shadcn `<Command>` inside a `<Popover>`. Debounced search via `useTagsSearch`. Selected tags rendered as chips above the input. Pressing Enter on a non-matching query adds a "new tag" entry (carries a `name` only, no id; sent to server in `tagNames[]`).
- [ ] **Step 6.3** Create `components/dashboard/GalleryUploader.tsx`: dropzone area + thumbnails grid. Drag-reorder via HTML5 DnD on thumbnails. Each thumbnail has an X to mark for removal (toggles a "pending delete" overlay until save). Emits `{ files: File[], removedIds: string[] }` to parent. Initial value: existing `productImages` rows from edit page.
- [ ] **Step 6.4** Create `components/dashboard/QuickAddProductModal.tsx`: `<Dialog>` with the minimum fields (title, price, thumbnail, delivery + delivery-specific). Reads `defaultProductActive` from `useProfile()`. Submits via `useCreateProduct`. On success: `router.push("/dashboard/products/" + created.id + "/edit")` and closes.

## Task 7: Refactor `ProductForm` (full editor)

- [ ] **Step 7.1** Edit `components/dashboard/ProductForm.tsx`:
  - Remove `seoTitle` and `seoKeywords` form fields and the SEO card.
  - Add a "Category" form field that uses `<CategoryPicker>`, bound to `categoryId`.
  - Add a "Tags" form field that uses `<TagsCombobox>`, bound to `tagIds` (existing) and `tagNames` (new ones, send as separate FormData entries).
  - Add a "Gallery" form section using `<GalleryUploader>` initialized from `product.gallery` (or `product.images`).
  - Wrap "Description, Access Duration, Gallery, Tags, Category, Contact details" inside a `<details>` element titled "More options" — open by default for edit, collapsed when arriving from quick-add (i.e. when `searchParams.get("from") === "quick-add"`).
- [ ] **Step 7.2** Update `productSchema` in `lib/validations/product.ts`: drop `seoTitle`, `seoKeywords`, accept `tagNames` as array of strings.

## Task 8: Settings page — Product defaults card

- [ ] **Step 8.1** Modify `app/(dashboard)/dashboard/settings/page.tsx`: add a card "Product defaults" with a single switch bound to `profile.defaultProductActive`. On change call `useUpdateProfile({ defaultProductActive: nextValue })`.

## Task 9: Products list — replace link with modal

- [ ] **Step 9.1** Modify `app/(dashboard)/dashboard/products/page.tsx`: replace both `<Link href="/dashboard/products/new">` instances with a button that opens `<QuickAddProductModal>`. Manage the modal's open state in the page.

## Task 10: Public product page metadata

- [ ] **Step 10.1** Update `app/store/[storeUrl]/product/[productId]/page.tsx` (and the data loader if needed) to provide `tags` (array of `{name}`). Replace `generateMetadata` to read title/description/tags rather than `seoTitle`/`seoKeywords`.

## Task 11: Delete `/dashboard/products/new`

- [ ] **Step 11.1** Remove `app/(dashboard)/dashboard/products/new/` directory entirely.

## Task 12: Verify

- [ ] **Step 12.1** `npx tsc --noEmit && npm run build` — both pass.
- [ ] **Step 12.2** Smoke (manual):
  - Settings: toggle "auto-add" on/off, verify persistence.
  - Click Add Product → modal opens → submit minimum fields → lands on edit page with product created.
  - Edit page: change category, add tags (existing + new), upload + reorder + remove gallery images, save.
  - Public product page: title and meta description reflect product data; no SEO field reads.
