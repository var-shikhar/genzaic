"use client"

import { useFormContext } from "react-hook-form"
import { Upload, X, Link as LinkIcon, FileText } from "lucide-react"
import type { ProductInput } from "@/lib/validations/product"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeliveryTypeSelector } from "./DeliveryTypeSelector"
import {
  GalleryUploader,
  type ExistingGalleryImage,
} from "./GalleryUploader"
import { TagsCombobox, type SelectedTag } from "./TagsCombobox"
import { cn } from "@/lib/utils"

export interface ProductFileLabel {
  name: string
  sub: string
  state: "staged" | "uploaded"
}

interface DeliverySectionProps {
  /** Currently staged product file (download deliveries). */
  productFile: File | null
  onPickProductFile: (file: File | null) => void
  /** When true, the existing uploaded file is marked for removal at submit. */
  removeProductFile: boolean
  onRemoveProductFile: (v: boolean) => void
  /** Pre-computed label shown above the upload area, or `null` if no file. */
  productFileLabel: ProductFileLabel | null
  /** Initial gallery (existing uploaded images for this product). */
  initialGallery: ExistingGalleryImage[]
  onGalleryChange: (g: { newFiles: File[]; removedIds: string[] }) => void
  tags: SelectedTag[]
  onTagsChange: (tags: SelectedTag[]) => void
}

/**
 * The "delivery" tab of the product editor: delivery type picker + the
 * delivery-specific UI (file upload / external URL / manual contacts), plus
 * the cross-cutting gallery and tags sections.
 *
 * Reads the form via `useFormContext`, so the parent must wrap rendering in
 * a `<Form>` / `FormProvider`. State that doesn't live in the form (file
 * staging, gallery, tags) is owned by the parent and threaded as props —
 * the parent needs it at submit time to build the FormData payload.
 */
export function DeliverySection({
  productFile,
  onPickProductFile,
  removeProductFile,
  onRemoveProductFile,
  productFileLabel,
  initialGallery,
  onGalleryChange,
  tags,
  onTagsChange,
}: DeliverySectionProps) {
  const form = useFormContext<ProductInput>()
  const deliveryType = form.watch("deliveryType")

  return (
    <div className="space-y-5 pt-5">
      <FormField
        control={form.control}
        name="deliveryType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Delivery method
            </FormLabel>
            <FormControl>
              <DeliveryTypeSelector
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {deliveryType === "download" && (
        <div className="space-y-3">
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Product file
          </Label>

          {productFileLabel && (
            <ul className="border border-border rounded-md divide-y divide-border">
              <li className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base font-medium truncate">
                    {productFileLabel.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-0.5">
                    {productFileLabel.state === "staged"
                      ? `${productFileLabel.sub} · staged for upload`
                      : "uploaded"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (productFile) onPickProductFile(null)
                    else onRemoveProductFile(true)
                  }}
                  className="p-2 hover:bg-flicker/10 text-flicker rounded-md"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            </ul>
          )}

          <label
            className={cn(
              "flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-md cursor-pointer",
              "hover:border-primary hover:bg-primary/5 transition-colors",
            )}
          >
            <Upload className="w-6 h-6 mb-1.5 text-muted-foreground" />
            <p className="font-display italic text-sm text-muted-foreground">
              {productFileLabel ? "Replace file" : "Click to upload product file"}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
              PDF · ZIP · MP4 · etc.
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                onPickProductFile(file)
                onRemoveProductFile(false)
                e.target.value = ""
              }}
            />
          </label>
        </div>
      )}

      {deliveryType === "external_link" && (
        <FormField
          control={form.control}
          name="externalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                External URL
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <LinkIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    variant="editorial"
                    className="pl-6"
                    placeholder="https://..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {deliveryType === "manual" && (
        <div className="space-y-4">
          <p className="font-display italic text-sm text-muted-foreground">
            Buyers will see one of these on their order confirmation. Add at
            least one before going live.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sellerContactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      variant="editorial"
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellerContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      variant="editorial"
                      placeholder="+91 9876543210"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellerContactWhatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input
                      variant="editorial"
                      placeholder="+91 9876543210"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Gallery + Tags live alongside delivery */}
      <div className="pt-4 border-t border-border space-y-5">
        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Gallery
          </Label>
          <GalleryUploader initial={initialGallery} onChange={onGalleryChange} />
        </div>

        <div className="space-y-2">
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Tags
          </Label>
          <TagsCombobox value={tags} onChange={onTagsChange} />
        </div>
      </div>
    </div>
  )
}
