"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, X, Sparkles, ArrowLeft, ArrowRight } from "lucide-react"
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
import { AIExtractionModal } from "./AIExtractionModal"
import { CategoryPicker } from "./CategoryPicker"
import { type SelectedTag } from "./TagsCombobox"
import { type ExistingGalleryImage } from "./GalleryUploader"
import { DeliverySection } from "./DeliverySection"
import { PublishRitual } from "@/components/brand/PublishRitual"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-error"
import { TOAST } from "@/lib/brand/voice"

export type ProductWithRelations = Product & {
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
  const pathname = usePathname()

  const [ritual, setRitual] = useState<{
    productTitle: string
    hexCode: string
    mode: "filed"
  } | null>(null)

  // Quick-add → edit hand-off: when the URL carries `?filed=1&title=...&hex=...`
  // (set by QuickAddProductModal after a successful create), fire the
  // "filed" celebration once, then strip those params so a refresh
  // doesn't replay it.
  useEffect(() => {
    if (searchParams.get("filed") !== "1") return
    const title = searchParams.get("title")
    const hex = searchParams.get("hex") ?? product.hexCode ?? null
    if (!title || !hex) return
    setRitual({ productTitle: title, hexCode: hex, mode: "filed" })
    const next = new URLSearchParams(searchParams.toString())
    next.delete("filed")
    next.delete("title")
    next.delete("hex")
    const query = next.toString()
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Surface schema errors as the user types/changes fields so they
    // don't have to click Save to learn what's wrong. Errors still clear
    // the moment the field becomes valid.
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: product.title ?? "",
      description: product.description ?? "",
      price: product.price ? parseFloat(product.price) : 0,
      originalPrice: product.originalPrice
        ? parseFloat(product.originalPrice)
        : undefined,
      categoryId: product.categoryId ?? undefined,
      deliveryType: product.deliveryType ?? "download",
      externalUrl: product.externalUrl ?? "",
      sellerContactEmail: product.sellerContactEmail ?? "",
      sellerContactPhone: product.sellerContactPhone ?? "",
      sellerContactWhatsapp: product.sellerContactWhatsapp ?? "",
      subscriptionDuration:
        (product.subscriptionDuration as ProductInput["subscriptionDuration"]) ??
        undefined,
      isActive: product.isActive ?? true,
      tagIds: [],
      tagNames: [],
    },
  })

  const deliveryType = form.watch("deliveryType")
  const isActive = form.watch("isActive")
  const liveTitle = form.watch("title")

  const handleAIExtract = (data: {
    title: string
    description: string
    price?: number
  }) => {
    form.setValue("title", data.title)
    form.setValue("description", data.description)
    if (data.price) form.setValue("price", data.price)
    setAiModalOpen(false)
    toast.success("— Filled from AI extraction.")
  }

  const onSubmit = async (values: ProductInput) => {
    // Downloadable products that go live MUST carry a file. The Zod
    // schema can't see component-side file state, so guard here: jump the
    // user back to the delivery tab where the upload lives, and toast.
    const hasFile = Boolean(
      productFile || (product.fileUrl && !removeProductFile),
    )
    if (values.deliveryType === "download" && values.isActive && !hasFile) {
      setTab("delivery")
      toast.error("— Upload a product file before going live.")
      return
    }

    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("price", String(values.price))
    formData.append("deliveryType", values.deliveryType)
    formData.append("isActive", String(values.isActive))
    if (values.description) formData.append("description", values.description)
    if (values.originalPrice != null)
      formData.append("originalPrice", String(values.originalPrice))
    if (values.categoryId) formData.append("categoryId", values.categoryId)
    if (values.externalUrl) formData.append("externalUrl", values.externalUrl)
    if (values.sellerContactEmail)
      formData.append("sellerContactEmail", values.sellerContactEmail)
    if (values.sellerContactPhone)
      formData.append("sellerContactPhone", values.sellerContactPhone)
    if (values.sellerContactWhatsapp)
      formData.append("sellerContactWhatsapp", values.sellerContactWhatsapp)
    if (values.subscriptionDuration)
      formData.append("subscriptionDuration", values.subscriptionDuration)
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile)
    if (productFile) formData.append("productFile", productFile)
    if (removeProductFile && !productFile)
      formData.append("removeProductFile", "true")

    tags.forEach((t) => {
      if (t.id) formData.append("tagIds", t.id)
      else formData.append("tagNames", t.name)
    })

    gallery.newFiles.forEach((f) => formData.append("galleryImages", f))
    gallery.removedIds.forEach((id) =>
      formData.append("removedGalleryImageIds", id),
    )

    const wasActive = Boolean(product.isActive)
    const isFirstPublish = !wasActive && values.isActive

    try {
      await updateProduct({ id: product.id, body: formData })
      toast.success(TOAST.productUpdated)
      if (isFirstPublish && product.hexCode) {
        const params = new URLSearchParams({
          ritual: product.hexCode,
          title: values.title,
        })
        router.push(`/dashboard/products?${params.toString()}`)
      } else {
        router.push("/dashboard/products")
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update product"))
    }
  }

  const productFileLabel = useMemo(() => {
    if (productFile)
      return {
        name: productFile.name,
        sub: formatBytes(productFile.size),
        state: "staged" as const,
      }
    if (product.fileUrl && !removeProductFile) {
      const last = product.fileUrl.split("/").pop() ?? "Uploaded file"
      return { name: last, sub: "uploaded", state: "uploaded" as const }
    }
    return null
  }, [productFile, product.fileUrl, removeProductFile])

  const dateline = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            // Only the explicit "Save Product" button on the delivery tab
            // is allowed to submit. Guard against stray submits coming from
            // Enter-in-input, nested Radix buttons that miss type="button",
            // or re-renders that swap the action button mid-click.
            if (tab !== "delivery") {
              e.preventDefault()
              return
            }
            form.handleSubmit(onSubmit)(e)
          }}
          className="space-y-3"
        >
          {/* Title block */}
          <div className="pb-4 border-b border-border">
            {/* Back link sits on its own row on mobile so the meta line below
                can show full identifiers without truncating. */}
            <button
              type="button"
              onClick={() => router.push("/dashboard/products")}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to products
            </button>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 mt-2">
              {product.hexCode && (
                <>
                  <span className="text-primary">#{product.hexCode}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span>{dateline}</span>
              <span aria-hidden>·</span>
              {isActive ? (
                <span className="text-primary">Live</span>
              ) : (
                <span>Draft</span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.035em] leading-[1.05] mt-2">
              {liveTitle?.trim() || (
                <span className="text-muted-foreground italic">
                  Untitled product
                </span>
              )}
            </h1>
          </div>

          {/* Two-tab editor — actions live at the right of the tabs */}
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "details" | "delivery")}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="bg-muted/40 p-1 h-auto rounded-full">
                <TabsTrigger
                  value="details"
                  className="font-display font-medium rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  Product details
                </TabsTrigger>
                <TabsTrigger
                  value="delivery"
                  className="font-display font-medium rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  Delivery &amp; extras
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3 ml-auto">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {field.value ? (
                          <span className="text-primary">Live</span>
                        ) : (
                          "Draft"
                        )}
                      </span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </label>
                  )}
                />
                <Button
                  type="button"
                  variant="paper"
                  size="sm"
                  onClick={() => setAiModalOpen(true)}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Extract with AI
                </Button>
                {tab === "details" ? (
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5"
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const ok = await form.trigger([
                        "title",
                        "price",
                        "originalPrice",
                        "categoryId",
                        "description",
                        "subscriptionDuration",
                      ])
                      if (ok) setTab("delivery")
                    }}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Saving…" : "Save Product"}
                  </Button>
                )}
              </div>
            </div>

            {/* Tab 1 — Product details */}
            <TabsContent value="details" className="space-y-5 pt-5">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_200px] gap-6">
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Title{" "}
                          <span className="text-flicker not-italic">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            variant="editorial"
                            placeholder="e.g. Notion Productivity Pack"
                            {...field}
                            className="font-display text-xl font-medium tracking-[-0.02em] py-1.5 h-auto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                            Price (₹){" "}
                            <span className="text-flicker not-italic">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              variant="editorial"
                              type="number"
                              min="0"
                              max="99999999.99"
                              step="0.01"
                              {...field}
                              className="font-display text-lg font-medium h-auto py-1.5"
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
                          <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                            Original Price
                          </FormLabel>
                          <FormControl>
                            <Input
                              variant="editorial"
                              type="number"
                              min="0"
                              max="99999999.99"
                              step="0.01"
                              placeholder="0"
                              {...field}
                              value={field.value ?? ""}
                              className="font-display text-lg font-medium h-auto py-1.5"
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what's included in your product..."
                            className="min-h-[120px] font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                          Access duration
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
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
                  <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Thumbnail
                  </Label>
                  {thumbnailPreview ? (
                    <div className="relative aspect-square rounded-md overflow-hidden border border-foreground/15 mt-2">
                      <Image
                        src={thumbnailPreview}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null)
                          setThumbnailFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-foreground/70 rounded-full hover:bg-foreground"
                      >
                        <X className="h-3 w-3 text-background" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border rounded-md cursor-pointer mt-2",
                        "hover:border-primary hover:bg-primary/5 transition-colors",
                      )}
                    >
                      <Upload className="w-5 h-5 mb-1.5 text-muted-foreground" />
                      <p className="font-display italic text-xs text-muted-foreground text-center px-2">
                        Upload thumbnail
                      </p>
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

            {/* Tab 2 — Delivery & extras */}
            <TabsContent value="delivery">
              <DeliverySection
                productFile={productFile}
                onPickProductFile={setProductFile}
                removeProductFile={removeProductFile}
                onRemoveProductFile={setRemoveProductFile}
                productFileLabel={productFileLabel}
                initialGallery={product.gallery ?? []}
                onGalleryChange={setGallery}
                tags={tags}
                onTagsChange={setTags}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      <AIExtractionModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onExtract={handleAIExtract}
      />

      {isPending && <GenzaicLoader.Page label="Saving your product" />}

      <PublishRitual payload={ritual} onDismiss={() => setRitual(null)} />
    </>
  )
}
