"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useCreateProduct } from "@/lib/queries/products"
import { useProfile } from "@/lib/queries/user"
import { getApiErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import { DeliveryTypeSelector } from "./DeliveryTypeSelector"

const quickSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(500),
    price: z.coerce.number().min(0, "Price must be positive"),
    deliveryType: z.enum(["download", "external_link", "manual"]),
    externalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    sellerContactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "external_link" && !data.externalUrl) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "External URL is required", path: ["externalUrl"] })
    }
    if (data.deliveryType === "manual" && !data.sellerContactEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact email is required", path: ["sellerContactEmail"] })
    }
  })

type QuickInput = z.infer<typeof quickSchema>

interface QuickAddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddProductModal({ open, onOpenChange }: QuickAddProductModalProps) {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { mutateAsync: createProduct, isPending } = useCreateProduct()
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [productFile, setProductFile] = useState<File | null>(null)

  const form = useForm<QuickInput>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      title: "",
      price: 0,
      deliveryType: "download",
      externalUrl: "",
      sellerContactEmail: "",
    },
  })

  const deliveryType = form.watch("deliveryType")

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview(null)
    setProductFile(null)
  }

  const onSubmit = async (values: QuickInput) => {
    if (!thumbnailFile) {
      toast.error("Please upload a thumbnail")
      return
    }
    if (values.deliveryType === "download" && !productFile) {
      toast.error("Please upload a product file")
      return
    }

    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("price", String(values.price))
    formData.append("deliveryType", values.deliveryType)
    formData.append("isActive", String(profile?.defaultProductActive ?? true))
    if (values.externalUrl) formData.append("externalUrl", values.externalUrl)
    if (values.sellerContactEmail) formData.append("sellerContactEmail", values.sellerContactEmail)
    formData.append("thumbnail", thumbnailFile)
    if (productFile) formData.append("productFile", productFile)

    try {
      const created = await createProduct(formData)
      toast.success("Product created — fill in the rest below")
      handleClose()
      router.push(`/dashboard/products/${created.id}/edit?from=quick-add`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create product"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Just the basics — you can add more details on the next screen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="space-y-2">
              <Label>Thumbnail *</Label>
              {thumbnailPreview ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image src={thumbnailPreview} alt="Thumbnail" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(thumbnailPreview)
                      setThumbnailPreview(null)
                      setThumbnailFile(null)
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    "flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer",
                    "hover:border-primary/50 hover:bg-accent/50 transition-colors",
                  )}
                >
                  <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload thumbnail</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) {
                        setThumbnailFile(f)
                        setThumbnailPreview(URL.createObjectURL(f))
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <FormField
              control={form.control}
              name="deliveryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery</FormLabel>
                  <FormControl>
                    <DeliveryTypeSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {deliveryType === "download" && (
              <div className="space-y-2">
                <Label>Product File *</Label>
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50">
                  <span className="text-sm text-muted-foreground">
                    {productFile ? productFile.name : "Click to upload"}
                  </span>
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
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {deliveryType === "manual" && (
              <FormField
                control={form.control}
                name="sellerContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-primary text-white" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
