"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, Copy, Check, Globe, X, Eye, Save } from "lucide-react"
import { storefrontSchema, type StorefrontInput } from "@/lib/validations/storefront"
import { useStorefront, useUpdateStorefront, useTogglePublish } from "@/lib/queries/storefront"
import { useProducts } from "@/lib/queries/products"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { StorefrontPreview, type PreviewProduct } from "@/components/store/StorefrontPreview"
import { cn } from "@/lib/utils"

const THEMES = [
  { id: "modern", label: "Modern" },
  { id: "bold", label: "Bold" },
  { id: "elegant", label: "Elegant" },
  { id: "playful", label: "Playful" },
  { id: "dark", label: "Dark" },
]

const FONTS = ["Inter", "Roboto", "Poppins", "Montserrat", "Lato", "Open Sans"]

const VALID_TABS = ["branding", "design", "contact", "payment"] as const
type TabValue = (typeof VALID_TABS)[number]

export function StorefrontEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as TabValue | null
  const activeTab: TabValue = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "branding"

  const { data: storefront, isLoading } = useStorefront()
  const { mutateAsync: updateStorefront, isPending: isUpdating } = useUpdateStorefront()
  const { mutateAsync: togglePublish, isPending: isToggling } = useTogglePublish()
  const { data: productsData } = useProducts({ status: "active", limit: 20 })

  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  const form = useForm<StorefrontInput>({
    resolver: zodResolver(storefrontSchema),
    defaultValues: {
      storeName: "",
      description: "",
      tagline: "",
      themeId: "modern",
      primaryColor: "#6366f1",
      fontFamily: "Inter",
      platformFeeMode: "buyer",
      upiId: "",
      contactEmail: "",
      contactPhone: "",
      contactWhatsapp: "",
      socialInstagram: "",
      socialTwitter: "",
      socialYoutube: "",
      socialWebsite: "",
    },
  })

  // Seed form once storefront loads (and on subsequent reloads after Save).
  useEffect(() => {
    if (!storefront) return
    form.reset({
      storeName: storefront.storeName ?? "",
      description: storefront.description ?? "",
      tagline: storefront.tagline ?? "",
      themeId: storefront.themeId,
      primaryColor: storefront.primaryColor,
      fontFamily: storefront.fontFamily,
      platformFeeMode: storefront.platformFeeMode,
      upiId: storefront.upiId ?? "",
      contactEmail: storefront.contactEmail ?? "",
      contactPhone: storefront.contactPhone ?? "",
      contactWhatsapp: storefront.contactWhatsapp ?? "",
      socialInstagram: storefront.socialInstagram ?? "",
      socialTwitter: storefront.socialTwitter ?? "",
      socialYoutube: storefront.socialYoutube ?? "",
      socialWebsite: storefront.socialWebsite ?? "",
    })
    setProfilePreview(storefront.profileImageUrl ?? null)
    setCoverPreview(storefront.coverImageUrl ?? null)
  }, [storefront, form])

  // Cleanup blob URLs on unmount.
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview)
      if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const watched = form.watch()

  const draftStorefront = useMemo(
    () => ({
      storeName: watched.storeName,
      tagline: watched.tagline,
      description: watched.description,
      profileImageUrl: profilePreview,
      coverImageUrl: coverPreview,
      themeId: watched.themeId,
      primaryColor: watched.primaryColor,
      fontFamily: watched.fontFamily,
      socialInstagram: watched.socialInstagram,
      socialTwitter: watched.socialTwitter,
      socialYoutube: watched.socialYoutube,
      socialWebsite: watched.socialWebsite,
    }),
    [watched, profilePreview, coverPreview],
  )

  const previewProducts: PreviewProduct[] = (productsData?.products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice,
    thumbnailUrl: p.thumbnailUrl,
  }))

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", next)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const onSubmit = async (values: StorefrontInput) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value))
      }
    })
    if (profileFile) formData.append("profileImage", profileFile)
    if (coverFile) formData.append("coverImage", coverFile)

    try {
      await updateStorefront(formData)
      // Drop pending file refs since the server now has them.
      setProfileFile(null)
      setCoverFile(null)
      toast.success("Storefront updated")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save"))
    }
  }

  const handleTogglePublish = async () => {
    try {
      const result = await togglePublish()
      toast.success(result.isPublished ? "Storefront published" : "Storefront unpublished")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update publish status"))
    }
  }

  const storeUrl = storefront?.storeUrl
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/store/${storefront.storeUrl}`
    : null

  const handleCopy = () => {
    if (storeUrl) {
      navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
          <Skeleton className="h-[600px] rounded-xl" />
          <Skeleton className="h-[600px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Storefront</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Live preview as you edit</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={storefront?.isPublished ? "success" : "secondary"}>
            {storefront?.isPublished ? "Published" : "Draft"}
          </Badge>
          <Switch
            checked={storefront?.isPublished ?? false}
            onCheckedChange={handleTogglePublish}
            disabled={isToggling}
          />
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="gradient-primary text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {storeUrl && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{storeUrl}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
        {/* Left pane: form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="storeName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl><Input placeholder="My Awesome Store" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tagline" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl><Input placeholder="Your store tagline" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell buyers about your store..." className="min-h-[100px]" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="space-y-2 pt-2">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-3">
                        {profilePreview ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                            <Image src={profilePreview} alt="Profile" fill sizes="64px" className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                if (profilePreview.startsWith("blob:")) URL.revokeObjectURL(profilePreview)
                                setProfilePreview(null)
                                setProfileFile(null)
                              }}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3.5 w-3.5 text-white" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (!f) return
                              setProfileFile(f)
                              setProfilePreview(URL.createObjectURL(f))
                            }} />
                          </label>
                        )}
                        <p className="text-xs text-muted-foreground">Recommended 400×400</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label>Cover Image</Label>
                      {coverPreview ? (
                        <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden border">
                          <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
                              setCoverPreview(null)
                              setCoverFile(null)
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[3/1] border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="h-6 w-6 mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Upload cover image</p>
                          <p className="text-[10px] text-muted-foreground">Recommended 1200×400</p>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (!f) return
                            setCoverFile(f)
                            setCoverPreview(URL.createObjectURL(f))
                          }} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Design</CardTitle></CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => form.setValue("themeId", theme.id, { shouldDirty: true })}
                            className={cn(
                              "p-2 rounded-lg border-2 text-left transition-all",
                              form.watch("themeId") === theme.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                            )}
                          >
                            <div className={cn("w-full h-8 rounded mb-1", {
                              "bg-gradient-to-br from-indigo-500 to-purple-600": theme.id === "modern",
                              "bg-gradient-to-br from-black to-gray-700": theme.id === "bold",
                              "bg-gradient-to-br from-rose-300 to-pink-600": theme.id === "elegant",
                              "bg-gradient-to-br from-yellow-400 to-orange-500": theme.id === "playful",
                              "bg-gradient-to-br from-gray-800 to-gray-950": theme.id === "dark",
                            })} />
                            <p className="text-xs font-medium">{theme.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField control={form.control} name="primaryColor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <input type="color" value={field.value} onChange={field.onChange} className="w-10 h-10 rounded cursor-pointer border" />
                            <Input {...field} value={field.value ?? ""} placeholder="#6366f1" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="fontFamily" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Contact &amp; Social</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {(["contactEmail", "contactPhone", "contactWhatsapp"] as const).map((name) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel>{name === "contactEmail" ? "Email" : name === "contactPhone" ? "Phone" : "WhatsApp"}</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ))}
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-3">Social Links</p>
                      {(["socialInstagram", "socialTwitter", "socialYoutube", "socialWebsite"] as const).map((name) => (
                        <FormField key={name} control={form.control} name={name} render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormLabel className="capitalize">{name.replace("social", "")}</FormLabel>
                            <FormControl><Input placeholder="https://..." {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="platformFeeMode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Fee Mode</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer pays the fee</SelectItem>
                            <SelectItem value="seller">Seller absorbs the fee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="upiId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input placeholder="yourname@upi" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>

        {/* Right pane: live preview (lg+) */}
        <div className="hidden lg:block lg:sticky lg:top-6 self-start">
          <div className="rounded-xl border overflow-hidden bg-background max-h-[calc(100vh-6rem)] overflow-y-auto">
            <StorefrontPreview
              storefront={draftStorefront}
              products={previewProducts}
              hideBuyActions
            />
          </div>
        </div>
      </div>

      {/* Mobile preview button */}
      <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="lg:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg gradient-primary text-white"
            aria-label="Show preview"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-full sm:max-w-md overflow-y-auto">
          <StorefrontPreview
            storefront={draftStorefront}
            products={previewProducts}
            hideBuyActions
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
