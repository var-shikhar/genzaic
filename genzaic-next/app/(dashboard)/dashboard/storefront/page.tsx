"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Image from "next/image"
import { Upload, Copy, Check, Globe, X } from "lucide-react"
import { storefrontSchema, type StorefrontInput } from "@/lib/validations/storefront"
import { useGetStorefrontQuery, useUpdateStorefrontMutation, useTogglePublishMutation } from "@/store/api/storefrontApi"
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
import { cn } from "@/lib/utils"

const THEMES = [
  { id: "modern", label: "Modern", description: "Clean & minimal" },
  { id: "bold", label: "Bold", description: "Strong & impactful" },
  { id: "elegant", label: "Elegant", description: "Sophisticated style" },
  { id: "playful", label: "Playful", description: "Fun & colorful" },
  { id: "dark", label: "Dark", description: "Dark mode focus" },
]

const FONTS = ["Inter", "Roboto", "Poppins", "Montserrat", "Lato", "Open Sans"]

export default function StorefrontPage() {
  const { data: storefront, isLoading } = useGetStorefrontQuery()
  const [updateStorefront, { isLoading: isUpdating }] = useUpdateStorefrontMutation()
  const [togglePublish, { isLoading: isToggling }] = useTogglePublishMutation()
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      contactEmail: "",
      contactPhone: "",
      contactWhatsapp: "",
      socialInstagram: "",
      socialTwitter: "",
      socialYoutube: "",
      socialWebsite: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  })

  useEffect(() => {
    if (storefront) {
      form.reset({
        storeName: storefront.storeName ?? "",
        description: storefront.description ?? "",
        tagline: storefront.tagline ?? "",
        themeId: storefront.themeId,
        primaryColor: storefront.primaryColor,
        fontFamily: storefront.fontFamily,
        platformFeeMode: storefront.platformFeeMode,
        contactEmail: storefront.contactEmail ?? "",
        contactPhone: storefront.contactPhone ?? "",
        contactWhatsapp: storefront.contactWhatsapp ?? "",
        socialInstagram: storefront.socialInstagram ?? "",
        socialTwitter: storefront.socialTwitter ?? "",
        socialYoutube: storefront.socialYoutube ?? "",
        socialWebsite: storefront.socialWebsite ?? "",
        seoTitle: storefront.seoTitle ?? "",
        seoDescription: storefront.seoDescription ?? "",
        seoKeywords: storefront.seoKeywords ?? "",
      })
      if (storefront.profileImageUrl) setProfilePreview(storefront.profileImageUrl)
      if (storefront.coverImageUrl) setCoverPreview(storefront.coverImageUrl)
    }
  }, [storefront, form])

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
      await updateStorefront(formData).unwrap()
      toast.success("Storefront updated!")
    } catch {
      toast.error("Failed to update storefront")
    }
  }

  const handleTogglePublish = async () => {
    try {
      const result = await togglePublish().unwrap()
      toast.success(result.isPublished ? "Storefront published!" : "Storefront unpublished")
    } catch {
      toast.error("Failed to update publish status")
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

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-20" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storefront</h1>
          <p className="text-muted-foreground mt-1">Customize your public store</p>
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
        </div>
      </div>

      {storeUrl && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-between p-4">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="monetization">Payment</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design">
              <Card>
                <CardHeader><CardTitle>Design</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {THEMES.map((theme) => (
                        <button key={theme.id} type="button"
                          onClick={() => form.setValue("themeId", theme.id)}
                          className={cn(
                            "flex flex-col gap-1 p-3 rounded-lg border-2 text-left transition-all",
                            form.watch("themeId") === theme.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          )}>
                          <div className={cn("w-full h-10 rounded", {
                            "bg-gradient-to-br from-indigo-500 to-purple-600": theme.id === "modern",
                            "bg-gradient-to-br from-black to-gray-700": theme.id === "bold",
                            "bg-gradient-to-br from-rose-300 to-pink-600": theme.id === "elegant",
                            "bg-gradient-to-br from-yellow-400 to-orange-500": theme.id === "playful",
                            "bg-gradient-to-br from-gray-800 to-gray-950": theme.id === "dark",
                          })} />
                          <p className={cn("text-xs font-medium", form.watch("themeId") === theme.id && "text-primary")}>{theme.label}</p>
                          <p className="text-xs text-muted-foreground">{theme.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                            {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4">
                      {profilePreview ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border">
                          <Image src={profilePreview} alt="Profile" fill className="object-cover" />
                          <button type="button" onClick={() => { setProfilePreview(null); setProfileFile(null) }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProfileFile(f); setProfilePreview(URL.createObjectURL(f)) } }} />
                        </label>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <p>Upload a profile picture</p>
                        <p className="text-xs">Recommended: 400x400px</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Cover Image</Label>
                    {coverPreview ? (
                      <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden border">
                        <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                        <button type="button" onClick={() => { setCoverPreview(null); setCoverFile(null) }}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors">
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-[3/1] border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload cover image</p>
                        <p className="text-xs text-muted-foreground">Recommended: 1200x400px</p>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)) } }} />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader><CardTitle>Contact & Social</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["contactEmail", "contactPhone", "contactWhatsapp"] as const).map((field) => (
                    <FormField key={field} control={form.control} name={field} render={({ field: f }) => (
                      <FormItem>
                        <FormLabel>{field === "contactEmail" ? "Email" : field === "contactPhone" ? "Phone" : "WhatsApp"}</FormLabel>
                        <FormControl><Input {...f} value={f.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-3">Social Links</p>
                    {(["socialInstagram", "socialTwitter", "socialYoutube", "socialWebsite"] as const).map((field) => (
                      <FormField key={field} control={form.control} name={field} render={({ field: f }) => (
                        <FormItem className="mb-3">
                          <FormLabel className="capitalize">{field.replace("social", "")}</FormLabel>
                          <FormControl><Input placeholder="https://..." {...f} value={f.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monetization">
              <Card>
                <CardHeader><CardTitle>Payment Settings</CardTitle></CardHeader>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="seoTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl><Input placeholder="Custom title for search engines" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="seoDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl><Textarea placeholder="Brief description for search results" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="seoKeywords" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl><Input placeholder="keyword1, keyword2, keyword3" {...field} value={field.value ?? ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="gradient-primary text-white" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
