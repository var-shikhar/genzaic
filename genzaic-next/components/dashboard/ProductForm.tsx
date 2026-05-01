"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, X, Sparkles, Link as LinkIcon, ChevronDown } from "lucide-react"
import { productSchema, type ProductInput } from "@/lib/validations/product"
import { useUpdateProduct } from "@/lib/queries/products"
import type { Product } from "@/lib/queries/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DeliveryTypeSelector } from "./DeliveryTypeSelector"
import { AIExtractionModal } from "./AIExtractionModal"
import { CategoryPicker } from "./CategoryPicker"
import { TagsCombobox, type SelectedTag } from "./TagsCombobox"
import { GalleryUploader, type ExistingGalleryImage } from "./GalleryUploader"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api-error"

export interface ProductWithRelations extends Product {
  categoryId?: string | null
  tags?: { id: string; name: string }[]
  gallery?: ExistingGalleryImage[]
}

interface ProductFormProps {
  product: ProductWithRelations
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromQuickAdd = searchParams.get("from") === "quick-add"

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(product.thumbnailUrl ?? null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [tags, setTags] = useState<SelectedTag[]>(
    (product.tags ?? []).map((t) => ({ id: t.id, name: t.name })),
  )
  const [gallery, setGallery] = useState<{ newFiles: File[]; removedIds: string[] }>({
    newFiles: [],
    removedIds: [],
  })
  const [moreOpen, setMoreOpen] = useState(!fromQuickAdd)

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

  const handleAIExtract = (data: { title: string; description: string; price?: number }) => {
    form.setValue("title", data.title)
    form.setValue("description", data.description)
    if (data.price) form.setValue("price", data.price)
    setAiModalOpen(false)
    toast.success("Filled from AI extraction")
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

    // Tags: existing ids and new names sent as separate repeated fields.
    tags.forEach((t) => {
      if (t.id) formData.append("tagIds", t.id)
      else formData.append("tagNames", t.name)
    })

    // Gallery
    gallery.newFiles.forEach((f) => formData.append("galleryImages", f))
    gallery.removedIds.forEach((id) => formData.append("removedGalleryImageIds", id))

    try {
      await updateProduct({ id: product.id, body: formData })
      toast.success("Product updated")
      router.push("/dashboard/products")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update product"))
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Product</h1>
              {fromQuickAdd && (
                <p className="text-muted-foreground text-sm mt-1">
                  Add details to make your product easier to find.
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAiModalOpen(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              AI Extract
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basics — always visible */}
              <Card>
                <CardHeader>
                  <CardTitle>Basics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Notion Productivity Pack" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
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
                          <FormLabel>Original Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Strikethrough price"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>Shows a discount badge</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery — always visible */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DeliveryTypeSelector value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {deliveryType === "download" && (
                    <div className="space-y-3">
                      <Label>Product File</Label>
                      <label
                        className={cn(
                          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                          "hover:border-primary/50 hover:bg-accent/50 transition-colors",
                        )}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {productFile ? productFile.name : product.fileUrl ? "File uploaded — click to replace" : "Click to upload product file"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PDF, ZIP, MP4, etc.</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
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
                          <FormLabel>External URL *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="https://..." {...field} value={field.value ?? ""} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* More options disclosure */}
              <details
                open={moreOpen}
                onToggle={(e) => setMoreOpen(e.currentTarget.open)}
                className="space-y-6 rounded-lg border bg-card"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4 list-none">
                  <span className="font-semibold">More options</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")} />
                </summary>
                <div className="space-y-6 px-4 pb-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what's included in your product..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
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
                    <Label>Tags</Label>
                    <TagsCombobox value={tags} onChange={setTags} />
                  </div>

                  <div className="space-y-2">
                    <Label>Gallery</Label>
                    <GalleryUploader
                      initial={product.gallery ?? []}
                      onChange={setGallery}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subscriptionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
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

                  {deliveryType === "manual" && (
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="sellerContactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ""} />
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
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9876543210" {...field} value={field.value ?? ""} />
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
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9876543210" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  {thumbnailPreview ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border mb-3">
                      <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null)
                          setThumbnailFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        "flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer mb-3",
                        "hover:border-primary/50 hover:bg-accent/50 transition-colors",
                      )}
                    >
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">Upload thumbnail</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setThumbnailFile(file)
                          setThumbnailPreview(URL.createObjectURL(file))
                        }}
                      />
                    </label>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="text-sm font-medium">Active</FormLabel>
                          <p className="text-xs text-muted-foreground">Visible in your store</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/dashboard/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gradient-primary text-white" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
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
