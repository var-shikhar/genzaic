"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateProduct } from "@/lib/queries/products"
import { useProfile } from "@/lib/queries/user"
import { getApiErrorMessage } from "@/lib/api-error"
import { DeliveryTypeSelector } from "./DeliveryTypeSelector"
import { CategoryPicker } from "./CategoryPicker"
import { TOAST } from "@/lib/brand/voice"

const quickSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  categoryId: z.string().uuid().optional().nullable(),
  deliveryType: z.enum(["download", "external_link", "manual"]),
})

type QuickInput = z.infer<typeof quickSchema>

interface QuickAddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddProductModal({
  open,
  onOpenChange,
}: QuickAddProductModalProps) {
  const router = useRouter()
  const { data: profile } = useProfile()
  const { mutateAsync: createProduct, isPending } = useCreateProduct()

  const form = useForm<QuickInput>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      title: "",
      categoryId: undefined,
      deliveryType: "download",
    },
  })

  const handleClose = () => {
    if (isPending) return
    onOpenChange(false)
    form.reset()
  }

  // Always reset form + clear any stale pending state when the modal re-opens.
  useEffect(() => {
    if (open)
      form.reset({ title: "", categoryId: undefined, deliveryType: "download" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (values: QuickInput) => {
    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("price", "0") // placeholder; user fills in on edit page
    formData.append("deliveryType", values.deliveryType)
    // Always create as inactive — user activates after completing details.
    formData.append("isActive", "false")
    if (values.categoryId) formData.append("categoryId", values.categoryId)

    try {
      const created = await createProduct(formData)
      toast.success(TOAST.productCreated)
      handleClose()
      router.push(
        `/dashboard/products/${created.slug ?? created.id}/edit?from=quick-add`,
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create product"))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold tracking-[-0.025em]">
            Add new product.
          </DialogTitle>
          <DialogDescription className="font-display italic text-muted-foreground">
            Just the basics — you&rsquo;ll add the rest on the next screen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Notion Productivity Pack"
                      autoFocus
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
              name="deliveryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    Type
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

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="paper"
                shape="pill"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                shape="pill"
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "File & continue"
                )}
              </Button>
            </div>
            {profile?.defaultProductActive === false && (
              <p className="text-xs text-muted-foreground">
                Hidden until you complete details. Toggle Active on the next
                screen to publish.
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
