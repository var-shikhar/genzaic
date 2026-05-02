"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import {
  Upload,
  X,
  Sparkles,
  Link as LinkIcon,
  FileText,
  ArrowLeft,
} from "lucide-react"
import { productSchema, type ProductInput } from "@/lib/validations/product"
import { useUpdateProduct } from "@/lib/queries/products"
import type { Product } from "@/lib/queries/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeliveryTypeSelector } from "./DeliveryTypeSelector"
import { AIExtractionModal } from "./AIExtractionModal"
import { CategoryPicker } from "./CategoryPicker"
import { TagsCombobox, type SelectedTag } from "./TagsCombobox"
import { GalleryUploader, type ExistingGalleryImage } from "./GalleryUploader"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-error"
import { TOAST } from "@/lib/brand/voice"

export interface ProductWithRelations extends Product {
  categoryId?: string | null
  hexCode?: string | null
  tags?: { id: string; name: string }[]
  gallery?: ExistingGalleryImage[]
}

interface ProductFormProps {
  product: ProductWithRelations
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromQuickAdd = searchParams.get("from") === "quick-add"

  const [tab, setTab] = useState<"details" | "delivery">("details")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    product.coverImageUrl ?? null,
  )
  const [productFile, setProductFile] = useState<File | null>(null)
  const [removeProductFile, setRemoveProductFile] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [tags, setTags] = useState<SelectedTag[]>(
    (product.tags ?? []).map((t) => ({ id: t.id, name: t.name })),
  )
  const [gallery, setGallery] = useState<{
    newFiles: File[]
    removedIds: string[]
  }>({ newFiles: [], removedIds: [] })

  const { mutateAsync: updateProduct, isPending } = useUpdateProduct()

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.title ?? "",
      description: product.description ?? "",
      price: product.price ? parseFloat(product.price) : 0,
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
      categoryId: product.categoryId ?? undefined,
      deliveryType: product.deliveryType ?? "download",
      externalUrl: product.externalUrl ?? "",
      sellerContactEmail: product.sellerContactEmail ?? "",
      sellerContactPhone: product.sellerContactPhone ?? "",
      sellerContactWhatsapp: product.sellerContactWhatsapp ?? "",
      subscriptionDuration: (product.subscriptionDuration as ProductInput["subscriptionDuration"]) ?? undefined,
      isActive: product.isActive ?? true,
      tagIds: [],
      tagNames: [],
    },
  })

  const deliveryType = form.watch("deliveryType")
  const isActive = form.watch("isActive")

  const handleAIExtract = (data: { title: string; description: string; price?: number }) => {
    form.setValue("title", data.title)
    form.setValue("description", data.description)
    if (data.price) form.setValue("price", data.price)
    setAiModalOpen(false)
    toast.success("— Filled from AI extraction.")
  }

  const onSubmit = async (values: ProductInput) => {
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("price", String(values.price))
    formData.append("deliveryType", values.deliveryType)
    formData.append("isActive", String(values.isActive))
    if (values.description) formData.append("description", values.description)
    if (values.originalPrice != null) formData.append("originalPrice", String(values.originalPrice))
    if (values.categoryId) formData.append("categoryId", values.categoryId)
    if (values.externalUrl) formData.append("externalUrl", values.externalUrl)
    if (values.sellerContactEmail) formData.append("sellerContactEmail", values.sellerContactEmail)
    if (values.sellerContactPhone) formData.append("sellerContactPhone", values.sellerContactPhone)
    if (values.sellerContactWhatsapp) formData.append("sellerContactWhatsapp", values.sellerContactWhatsapp)
    if (values.subscriptionDuration) formData.append("subscriptionDuration", values.subscriptionDuration)
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile)
    if (productFile) formData.append("productFile", productFile)
    if (removeProductFile && !productFile) formData.append("removeProductFile", "true")

    tags.forEach((t) => {
      if (t.id) formData.append("tagIds", t.id)
      else formData.append("tagNames", t.name)
    })

    gallery.newFiles.forEach((f) => formData.append("galleryImages", f))
    gallery.removedIds.forEach((id) => formData.append("removedGalleryImageIds", id))

    try {
      await updateProduct({ id: product.id, body: formData })
      toast.success(TOAST.productUpdated)
      router.push("/dashboard/products")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update product"))
    }
  }

  const productFileLabel = useMemo(() => {
    if (productFile) return { name: productFile.name, sub: formatBytes(productFile.size), state: "staged" as const }
    if (product.fileUrl && !removeProductFile) {
      const last = product.fileUrl.split("/").pop() ?? "Uploaded file"
      return { name: last, sub: "uploaded", state: "uploaded" as const }
    }
    return null
  }, [productFile, product.fileUrl, removeProductFile])

  const dateline = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Compact header strip */}
          <header className="flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => router.push("/dashboard/products")}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to products
            </button>

            <div className="flex items-center gap-4">
              {/* Inline live toggle */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {field.value ? <span className="text-primary">Live</span> : "Draft"}
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
              <Button
                type="button"
                variant="paper"
                shape="pill"
                size="sm"
                onClick={() => setAiModalOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Extract with AI
              </Button>
              <Button type="submit" shape="pill" size="sm" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </header>

          {/* Title block */}
          <div className="pb-6 border-b border-border">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {product.hexCode && <><span className="text-primary">#{product.hexCode}</span> · </>}
              {dateline}{isActive ? <> · <span className="text-primary">Live</span></> : <> · Draft</>}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-[1] mt-2">
              {product.title || <span className="text-muted-foreground italic">Untitled product</span>}
            </h1>
            <p className="font-display italic text-base text-muted-foreground mt-2">
              {fromQuickAdd
                ? "Just a few more details and you're ready to publish."
                : "Update the details, the delivery, the tags."}
            </p>
          </div>

          {/* Two-tab editor */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as "details" | "delivery")}>
            <TabsList className="bg-muted/60">
              <TabsTrigger value="details" className="font-display font-medium">Product details</TabsTrigger>
              <TabsTrigger value="delivery" className="font-display font-medium">Delivery & tags</TabsTrigger>
            </TabsList>

            {/* Tab 1 — Product details */}
            <TabsContent value="details" className="space-y-8 pt-6">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Title</FormLabel>
                        <FormControl>
                          <Input
                            variant="editorial"
                            placeholder="e.g. Notion Productivity Pack"
                            {...field}
                            className="font-display text-2xl font-medium tracking-[-0.02em] py-2 h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              variant="editorial"
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              className="font-display text-xl font-medium h-auto py-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Was</FormLabel>
                          <FormControl>
                            <Input
                              variant="editorial"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Strikethrough price"
                              {...field}
                              value={field.value ?? ""}
                              className="font-display text-xl font-medium h-auto py-2"
                            />
                          </FormControl>
                          <FormDescription className="font-mono text-[10px] uppercase tracking-[0.12em]">
                            Shows a discount badge
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what's included in your product..."
                            className="min-h-[160px] font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Gallery</Label>
                    <GalleryUploader initial={product.gallery ?? []} onChange={setGallery} />
                  </div>

                  <FormField
                    control={form.control}
                    name="subscriptionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Access duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Lifetime" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1 month">1 Month</SelectItem>
                            <SelectItem value="3 months">3 Months</SelectItem>
                            <SelectItem value="6 months">6 Months</SelectItem>
                            <SelectItem value="1 year">1 Year</SelectItem>
                            <SelectItem value="lifetime">Lifetime</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Thumbnail</Label>
                  {thumbnailPreview ? (
                    <div className="relative aspect-[4/5] rounded-md overflow-hidden border border-foreground/15 mt-2">
                      <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => { setThumbnailPreview(null); setThumbnailFile(null) }}
                        className="absolute top-2 right-2 p-1 bg-foreground/70 rounded-full hover:bg-foreground"
                      >
                        <X className="h-3 w-3 text-background" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center aspect-[4/5] border-2 border-dashed border-border rounded-md cursor-pointer mt-2",
                        "hover:border-primary hover:bg-primary/5 transition-colors",
                      )}
                    >
                      <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                      <p className="font-display italic text-xs text-muted-foreground text-center px-2">Upload thumbnail</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setThumbnailFile(file)
                          setThumbnailPreview(URL.createObjectURL(file))
                          e.target.value = ""
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2 — Delivery & tags */}
            <TabsContent value="delivery" className="space-y-8 pt-6">
              <FormField
                control={form.control}
                name="deliveryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Delivery method</FormLabel>
                    <FormControl>
                      <DeliveryTypeSelector value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {deliveryType === "download" && (
                <div className="space-y-3">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Product file</Label>

                  {productFileLabel && (
                    <ul className="border border-border rounded-md divide-y divide-border">
                      <li className="grid grid-cols-[40px_1fr_auto] items-center gap-3 p-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-base font-medium truncate">{productFileLabel.name}</div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-0.5">
                            {productFileLabel.state === "staged" ? `${productFileLabel.sub} · staged for upload` : "uploaded"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (productFile) setProductFile(null)
                            else setRemoveProductFile(true)
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
                        setProductFile(file)
                        setRemoveProductFile(false)
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
                      <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">External URL</FormLabel>
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
                    Buyers will see one of these on their order confirmation. Add at least one before going live.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="sellerContactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <Input variant="editorial" type="email" placeholder="you@example.com" {...field} value={field.value ?? ""} />
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
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Phone</FormLabel>
                          <FormControl>
                            <Input variant="editorial" placeholder="+91 9876543210" {...field} value={field.value ?? ""} />
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
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">WhatsApp</FormLabel>
                          <FormControl>
                            <Input variant="editorial" placeholder="+91 9876543210" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Category + Tags live alongside delivery */}
              <div className="pt-4 border-t border-border space-y-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CategoryPicker
                          value={field.value ?? null}
                          onChange={(id) => field.onChange(id ?? undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Tags</Label>
                  <TagsCombobox value={tags} onChange={setTags} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer save row */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              shape="pill"
              onClick={() => router.push("/dashboard/products")}
            >
              Cancel
            </Button>
            <Button type="submit" shape="pill" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Form>

      <AIExtractionModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onExtract={handleAIExtract}
      />
    </>
  )
}
