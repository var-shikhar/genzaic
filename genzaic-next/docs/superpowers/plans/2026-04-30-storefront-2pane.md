# A4 — Storefront 2-Pane Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen by user) to implement this plan inline.

**Goal:** Two-pane storefront editor with real-time preview, 4 consolidated tabs, no autosave, mobile preview sheet, dropped SEO tab.

**Architecture:** `<StorefrontEditor>` owns RHF + previews (object URLs for unsaved images). `<StorefrontPreview>` is a shared presentational component used by both the editor's right pane and the public store page (`/store/[storeUrl]`). Active tab in URL search params.

**Tech stack:** Next.js 15, RHF + Zod, shadcn UI (Sheet, Tabs), TanStack Query (already in place from A1).

**No commits / no tests in this plan.**

---

## Task 1: Extract `<StorefrontPreview>` shared component

**Files:**
- Create: `components/store/StorefrontPreview.tsx`
- Modify: `app/store/[storeUrl]/page.tsx` (use the new component)

- [ ] **Step 1.1** Create `components/store/StorefrontPreview.tsx` containing the JSX currently inside `app/store/[storeUrl]/page.tsx` for the storefront layout (cover, profile, name, tagline, social links, products grid). Accept props:
```ts
interface Props {
  storefront: {
    storeName?: string | null
    tagline?: string | null
    description?: string | null
    profileImageUrl?: string | null
    coverImageUrl?: string | null
    themeId?: string | null
    primaryColor?: string | null
    fontFamily?: string | null
    socialInstagram?: string | null
    socialTwitter?: string | null
    socialYoutube?: string | null
    socialWebsite?: string | null
    seller?: {
      totalSales?: number
      followersCount?: number
    } | null
  }
  products: Array<{
    id: string
    title: string
    price: string
    originalPrice?: string | null
    thumbnailUrl?: string | null
  }>
  productListLink?: (productId: string) => string  // optional override; preview hides links
  hideBuyActions?: boolean                          // true in editor preview
}
```
- [ ] **Step 1.2** Refactor `app/store/[storeUrl]/page.tsx` to render `<StorefrontPreview storefront={storefront} products={products} />` instead of inlining the JSX. Keep its existing data loader and `<PublicProductBrowser>` for the interactive island. (Concretely: replace the cover/profile/name JSX with `<StorefrontPreview>`; leave the `<PublicProductBrowser>` block as-is below it. Or merge the products grid into the new component — either works. Pick whichever is least invasive, document choice in commit.)
- [ ] **Step 1.3** Update `generateMetadata` in `app/store/[storeUrl]/page.tsx` (if present) to use `storeName`, `tagline`, `description` instead of `seoTitle` / `seoDescription` / `seoKeywords`.
- [ ] **Step 1.4** Type-check: `npx tsc --noEmit`. Build: `npm run build`. Both pass.

---

## Task 2: Build `<StorefrontEditor>` (replaces current page body)

**Files:**
- Create: `components/dashboard/StorefrontEditor.tsx`
- Modify: `app/(dashboard)/dashboard/storefront/page.tsx` (becomes a thin shell)

- [ ] **Step 2.1** Create `components/dashboard/StorefrontEditor.tsx`. Internally:
  - Load `useStorefront()` to seed form defaults.
  - Initialize RHF with `storefrontSchema`.
  - Maintain `profileFile`, `coverFile`, `profilePreview`, `coverPreview` local state (object URLs).
  - Watch all form values; build a `draftStorefront` shape merging form values + image previews.
  - Render layout:
    ```tsx
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
      <div className="space-y-4">
        <Header /> {/* badge, publish switch, save button */}
        <Tabs defaultValue={tab} onValueChange={updateTabUrl}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>
          <TabsContent value="branding"><BrandingTab /></TabsContent>
          <TabsContent value="design"><DesignTab /></TabsContent>
          <TabsContent value="contact"><ContactTab /></TabsContent>
          <TabsContent value="payment"><PaymentTab /></TabsContent>
        </Tabs>
      </div>
      <div className="hidden lg:block lg:sticky lg:top-6 self-start">
        <div className="rounded-xl border overflow-hidden bg-background h-[80vh] overflow-y-auto">
          <StorefrontPreview storefront={draftStorefront} products={previewProducts} hideBuyActions />
        </div>
      </div>
    </div>
    <MobilePreviewButton draftStorefront={draftStorefront} products={previewProducts} />
    ```
  - The four tab content blocks contain the merged-tab fields per spec §3.3. Branding merges current Basic + Media; Design / Contact / Payment carry over as-is. SEO tab is omitted.
  - Save flow: builds FormData (existing pattern from current page), calls `useUpdateStorefront`, on success calls `form.reset(updated)` to clear dirty state, revokes object URLs.
  - URL tab state: read `useSearchParams().get("tab")` (default "branding"), write via `router.replace(?tab=...)` on tab change.
- [ ] **Step 2.2** Implement `<MobilePreviewButton>` (file in same component file or a sibling): `lg:hidden fixed bottom-4 right-4 z-50` button containing an Eye icon. On click opens a `<Sheet side="right">` with the same `<StorefrontPreview>` inside.
- [ ] **Step 2.3** Replace `app/(dashboard)/dashboard/storefront/page.tsx` body with `<StorefrontEditor />`. The page wrapper just provides the `<Suspense>` boundary if needed and forwards the dashboard layout. Delete inlined tabs / form code.
- [ ] **Step 2.4** Drop `seoTitle`, `seoDescription`, `seoKeywords` from the form's default values and submit FormData. Server endpoint already accepts these fields (legacy) — we just stop sending them.
- [ ] **Step 2.5** Type-check + build: both pass.
- [ ] **Step 2.6** Manual smoke (user-side): open `/dashboard/storefront`. Edit store name → preview updates instantly. Switch tabs → URL updates. Pick a new profile image → preview shows it without saving. Click Save → toast appears, preview unchanged. Open the public `/store/<slug>` URL → metadata title comes from store name; cover/profile/products render via the shared component.
