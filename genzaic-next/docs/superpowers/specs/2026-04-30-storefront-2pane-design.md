# A4 — Storefront 2-Pane Editor with Live Preview

**Date:** 2026-04-30
**Status:** Approved (design)
**Phase:** A4 (after A1, A2, A3)

## 1. Goal

Replace the current tabs-only storefront editor with a two-pane layout:
- **Left pane (40%)**: control surface — tabs containing the form fields.
- **Right pane (60%)**: live preview of the public store, reflecting current (unsaved) form state in real time.
- **Mobile (<lg)**: full-width controls + a floating "Preview" icon-button that opens the preview as a full-screen sheet.

The user can change a store name, swap a profile image, pick a different theme color — and immediately see the public store render the new state on the right. Saving is explicit (Save button at the top of the controls).

## 2. Decisions

| # | Decision |
|---|---|
| Q1 | Desktop: 40/60 split (controls / preview) at `lg` breakpoint and up. |
| Q2 | Live preview rendered via a shared `<StorefrontPreview>` component (same JSX as `/store/[storeUrl]`). It reads current form values, not saved DB state. |
| Q3 | No autosave. Explicit Save button at top of controls; preview reflects draft state until Save is clicked. |
| Q4 | Consolidated from 6 tabs to 4: **Branding** (basic + media merged), **Design**, **Contact**, **Payment**. SEO tab dropped (see Q5). Active tab persisted in URL search param `?tab=`. |
| Q5 | Drop the SEO tab and the storefront SEO inputs (`seoTitle`, `seoDescription`, `seoKeywords`). Auto-generate the public store's `<title>` and `<meta description>` from store name + tagline + description. Columns remain in DB (nullable, ignored by editor). |
| Q6 | Mobile (<lg): floating "Preview" icon button (bottom-right). Opens preview as a full-screen `<Sheet>`. |

## 3. Architecture

### 3.1 Component split

```
app/(dashboard)/dashboard/storefront/page.tsx
├── StorefrontEditor (client)
│   ├── Left pane: <StorefrontEditorTabs> (form, tabs, save button)
│   └── Right pane: <StorefrontPreview> (live render from form values)
```

`<StorefrontEditor>` owns the React Hook Form, image previews (object URLs for unsaved files), and the Save submission. It passes derived "draft storefront" + "draft profile/cover URLs" down to both the tabs (for inputs) and the preview (for rendering).

`<StorefrontPreview>` is purely presentational — it accepts a `storefront` shape and a list of `products` and renders the store. Same JSX shape that `app/store/[storeUrl]/page.tsx` uses, but factored into a shared component. The public page is updated to call this same component (single source of truth for layout).

### 3.2 Live preview data flow

- Form fields use React Hook Form. The whole form state is `watch()`-ed in `<StorefrontEditor>` to derive the preview's `storefront` prop.
- For images: when a user picks a new profile or cover file, the editor stores the `File` and creates an object URL via `URL.createObjectURL(file)`. That object URL is fed to the preview as `profileImageUrl` / `coverImageUrl` so the preview shows the new image without uploading anything yet. On save, the file is uploaded, the form is re-initialized from the server response, and the object URL is revoked.
- For the products list shown in the preview: read once from `useProducts({ status: "active", limit: 20 })`. Reorder/show-hide is not part of A4; we just show what's in the store.

### 3.3 Tab consolidation

| New tab | Sources | Fields |
|---|---|---|
| **Branding** | (Basic + Media) | storeName, tagline, description, profileImage upload, coverImage upload |
| **Design** | (Design) | themeId (5 options), primaryColor, fontFamily |
| **Contact** | (Contact) | contactEmail, contactPhone, contactWhatsapp, socialInstagram, socialTwitter, socialYoutube, socialWebsite |
| **Payment** | (Monetization) | platformFeeMode (seller/buyer), upiId |

The active tab is reflected in the URL (`?tab=branding|design|contact|payment`), default `branding`. Switching tabs uses `router.replace()` so back-button history isn't polluted.

### 3.4 Save flow

The "Save" button at the top of the left pane:
- Builds FormData (form values + any selected `profileImage` / `coverImage` files).
- Calls `useUpdateStorefront`.
- On success: form is reset from the returned storefront (so dirty state clears), object URLs are revoked, toast shows "Saved".

Publish toggle stays in its current header position (inside `<StorefrontEditor>` header bar). It uses `useTogglePublish`. No interaction with the form state.

### 3.5 Mobile preview sheet

When viewport < lg, the layout collapses to single column showing only the controls. A floating button at `bottom-4 right-4` (icon: Eye) opens a `<Sheet side="right">` containing `<StorefrontPreview>` at full height. Closing returns to the form.

## 4. Public store page (`app/store/[storeUrl]/page.tsx`)

- Refactored to render `<StorefrontPreview>` with the loaded data, instead of inlining the JSX. Saves duplication and keeps preview/production parity.
- `generateMetadata` is updated to read store name + tagline/description (not `seoTitle`/`seoDescription`/`seoKeywords`).

## 5. UI Implementation Notes

- Width split via Tailwind: `<div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">` (2:3 ratio = 40/60).
- The right pane has `lg:sticky lg:top-6` so the preview stays visible as the left controls scroll.
- The preview must clip overflow and not let the simulated public store leak page-level styles. Wrap it in a `<div className="rounded-xl border overflow-hidden bg-background">`.
- All form fields are uncontrolled inputs registered through React Hook Form (matching today's pattern). No new form library.

## 6. Acceptance criteria

- Editing any field on the left immediately updates the right pane.
- Profile/cover image upload preview shows the new image instantly, no save required.
- Clicking Save persists changes; preview continues to show the same data after save (no flicker).
- Tabs persist in URL (`?tab=design`); refresh restores the same tab.
- Public store page (`/store/[slug]`) is rendered via the same `<StorefrontPreview>` component.
- Mobile floating Preview button works; closing returns to controls intact (form state preserved).
- Storefront SEO fields are not surfaced in the editor; metadata still works correctly.
- `npm run build` and `npx tsc --noEmit` pass.

## 7. Out of scope

- Reordering products / featured products / collections — the preview product list mirrors the published list verbatim.
- Theme presets beyond the 5 already in the dropdown.
- Custom CSS / advanced theming.
- Drag-and-drop blocks. (User mentioned this for future "decoration"; not in A4.)

## 8. Risks

| Risk | Mitigation |
|---|---|
| Heavy re-rendering of the preview on every keystroke | React Hook Form's `watch()` returns a stable snapshot per render; preview tree is small. If needed, debounce text-input updates by 100ms before pushing to preview. |
| Object URL leaks from image previews | Cleanup on unmount + on save replacement. |
| Public page parity drift | Single shared `<StorefrontPreview>` used by both, so any change benefits both. |
