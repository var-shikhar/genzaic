"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, X, Sparkles, Link as LinkIcon, Phone } from "lucide-react"
import { productSchema, type ProductInput } from "@/lib/validations/product"
import { useCreateProductMutation, useUpdateProductMutation } from "@/store/api/productsApi"
import type { Product } from "@/store/api/productsApi"
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
import { cn } from "@/lib/utils"

interface ProductFormProps {
  product?: Product
  mode: "create" | "edit"
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(product?.thumbnailUrl ?? null)
  const [productFile, setProductFile] = useState<File | null>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const isLoading = isCreating || isUpdating

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? "",
      description: product?.description ?? "",
      price: product?.price ? parseFloat(product.price) : 0,
      originalPrice: product?.originalPrice ? parseFloat(product.originalPrice) : undefined,
      deliveryType: product?.deliveryType ?? "download",
      externalUrl: product?.externalUrl ?? "",
      sellerContactEmail: product?.sellerContactEmail ?? "",
      sellerContactPhone: product?.sellerContactPhone ?? "",
      sellerContactWhatsapp: product?.sellerContactWhatsapp ?? "",
      subscriptionDuration: (product?.subscriptionDuration as ProductInput["subscriptionDuration"]) ?? undefined,
      seoTitle: product?.seoTitle ?? "",
      seoKeywords: product?.seoKeywords ?? "",
      isActive: product?.isActive ?? true,
    },
  })

  const deliveryType = form.watch("deliveryType")

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const handleAIExtract = (data: { title: string; description: string; price?: number }) => {
    form.setValue("title", data.title)
    form.setValue("description", data.description)
    if (data.price) form.setValue("price", data.price)
    setAiModalOpen(false)
    toast.success("Product details filled from AI extraction")
  }

  const onSubmit = async (values: ProductInput) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value))
      }
    })
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile)
    if (productFile) formData.append("productFile", productFile)

    try {
      if (mode === "create") {
        await createProduct(formData).unwrap()
        toast.success("Product created successfully!")
      } else {
        await updateProduct({ id: product!.id, body: formData }).unwrap()
        toast.success("Product updated successfully!")
      }
      router.push("/dashboard/products")
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } }
      toast.error(err?.data?.error || "Something went wrong")
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{mode === "create" ? "Add Product" : "Edit Product"}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "create" ? "Create a new digital product" : "Update your product details"}
              </p>
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
            {/* Left column - main details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Ultimate Notion Template Pack" {...field} />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0" {...field} />
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
                </CardContent>
              </Card>

              {/* Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
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
                      <label className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                        "hover:border-primary/50 hover:bg-accent/50 transition-colors"
                      )}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {productFile ? productFile.name : "Click to upload product file"}
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
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Custom title for search engines" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="notion, template, productivity" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription>Comma-separated keywords</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right column - media + status */}
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
                        onClick={() => { setThumbnailPreview(null); setThumbnailFile(null) }}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className={cn(
                      "flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer mb-3",
                      "hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    )}>
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">Upload thumbnail</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
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
                          <p className="text-xs text-muted-foreground">Product is visible in your store</p>
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
                <Button type="submit" className="flex-1 gradient-primary text-white" disabled={isLoading}>
                  {isLoading ? "Saving..." : mode === "create" ? "Create" : "Update"}
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
