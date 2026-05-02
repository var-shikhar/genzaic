"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Upload, X, Percent, Wallet, Users, PackagePlus } from "lucide-react"
import Image from "next/image"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth"
import { useProfile, useUpdateProfile, useChangePassword } from "@/lib/queries/user"
import { useStorefront, useUpdateStorefront } from "@/lib/queries/storefront"
import { Switch } from "@/components/ui/switch"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/utils"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user as { name?: string | null; email?: string | null; image?: string | null; storeUrl?: string | null; isSeller?: boolean } | undefined
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [platformFeeMode, setPlatformFeeMode] = useState<"seller" | "buyer">("seller")

  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutateAsync: changePassword, isPending: isChangingPw } = useChangePassword()
  const { data: storefront, isLoading: storefrontLoading } = useStorefront()
  const { mutateAsync: updateStorefront, isPending: isSavingFee } = useUpdateStorefront()
  const { data: profile } = useProfile()
  const [defaultActiveSaving, setDefaultActiveSaving] = useState(false)

  const handleToggleDefaultActive = async (next: boolean) => {
    setDefaultActiveSaving(true)
    const formData = new FormData()
    formData.append("defaultProductActive", String(next))
    try {
      await updateProfile(formData)
      toast.success(next ? "New products will be added to your store automatically" : "New products will be hidden by default")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save"))
    } finally {
      setDefaultActiveSaving(false)
    }
  }

  useEffect(() => {
    if (storefront) setPlatformFeeMode(storefront.platformFeeMode)
  }, [storefront])

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? "", storeUrl: user?.storeUrl ?? "" },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const onProfileSubmit = async (values: UpdateProfileInput) => {
    const formData = new FormData()
    if (values.name) formData.append("name", values.name)
    if (values.storeUrl) formData.append("storeUrl", values.storeUrl)
    if (avatarFile) formData.append("avatar", avatarFile)
    try {
      const updated = await updateProfile(formData)
      await update({ name: updated.name, image: updated.avatarUrl })
      toast.success("Profile updated!")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed"))
    }
  }

  const onPasswordSubmit = async (values: ChangePasswordInput) => {
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      toast.success("Password changed successfully!")
      passwordForm.reset()
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Password change failed"))
    }
  }

  const handleSavePlatformFee = async () => {
    const formData = new FormData()
    formData.append("platformFeeMode", platformFeeMode)
    try {
      await updateStorefront(formData)
      toast.success("Platform fee settings saved!")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save fee settings"))
    }
  }

  // Example price calculations (platform fee: 5%, GST: 18% on product price)
  const examplePrice = 1000
  const platformFee = Math.round(examplePrice * 0.05)
  const gst = Math.round(examplePrice * 0.18)

  if (storefrontLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="pb-6 border-b border-primary/30">
        <EyebrowLabel>Account & defaults</EyebrowLabel>
        <EditorsHeadline accentWord="Preferences." size="xl" className="mt-3">
          Your Preferences.
        </EditorsHeadline>
        <p className="font-display italic text-base text-muted-foreground mt-2">
          Profile, defaults, password, danger zone.
        </p>
      </header>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {avatarPreview || user?.image ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image src={(avatarPreview || user?.image)!} alt="Avatar" fill className="object-cover" />
                  {avatarPreview && (
                    <button
                      onClick={() => { setAvatarPreview(null); setAvatarFile(null) }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              ) : (
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-xl bg-foreground text-background font-display font-semibold">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <label className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span><Upload className="mr-2 h-4 w-4" /> Change Photo</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)) }
                }}
              />
            </label>
          </div>

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input value={user?.email ?? ""} disabled className="bg-muted" />
              </div>
              {user?.isSeller && (
                <FormField control={profileForm.control} name="storeUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store URL</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm text-muted-foreground">
                          /store/
                        </span>
                        <Input className="rounded-l-none" placeholder="my-store" {...field} value={field.value ?? ""} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <Button type="submit" shape="pill" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Product defaults */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Product defaults</CardTitle>
              <CardDescription>Defaults applied when you add a new product</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Add new products to my store automatically</p>
              <p className="text-sm text-muted-foreground mt-1">
                When off, new products are saved as drafts (hidden) and you turn them on per product.
              </p>
            </div>
            <Switch
              checked={profile?.defaultProductActive ?? true}
              disabled={defaultActiveSaving}
              onCheckedChange={handleToggleDefaultActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Fee Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Percent className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <CardTitle>Platform Fee Settings</CardTitle>
              <CardDescription>Choose who pays the 5% platform fee</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={platformFeeMode}
            onValueChange={(v) => setPlatformFeeMode(v as "seller" | "buyer")}
            className="space-y-4"
          >
            {/* Seller absorbs */}
            <Label
              htmlFor="fee-seller"
              className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                platformFeeMode === "seller"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <RadioGroupItem value="seller" id="fee-seller" className="mt-1" />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4" />
                  I&apos;ll absorb the platform fee
                </div>
                <p className="text-sm text-muted-foreground">
                  The 5% platform fee will be deducted from your earnings. Buyers pay only the product price + GST.
                </p>
                {platformFeeMode === "seller" && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p className="text-muted-foreground">Example for {fmt(examplePrice)} product:</p>
                    <div className="flex justify-between">
                      <span>Buyer pays (Price + GST):</span>
                      <span className="font-medium">{fmt(examplePrice + gst)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform fee (deducted):</span>
                      <span>-{fmt(platformFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                      <span>You receive:</span>
                      <span>{fmt(examplePrice - platformFee)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Label>

            {/* Buyer pays */}
            <Label
              htmlFor="fee-buyer"
              className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                platformFeeMode === "buyer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <RadioGroupItem value="buyer" id="fee-buyer" className="mt-1" />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" />
                  Buyer pays the platform fee
                </div>
                <p className="text-sm text-muted-foreground">
                  The 5% platform fee will be added to the buyer&apos;s total. You receive 100% of your product price.
                </p>
                {platformFeeMode === "buyer" && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                    <p className="text-muted-foreground">Example for {fmt(examplePrice)} product:</p>
                    <div className="flex justify-between">
                      <span>Product price:</span>
                      <span>{fmt(examplePrice)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform fee (10%):</span>
                      <span>+{fmt(platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (18%):</span>
                      <span>+{fmt(gst)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Buyer pays:</span>
                      <span>{fmt(examplePrice + platformFee + gst)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                      <span>You receive:</span>
                      <span>{fmt(examplePrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Label>
          </RadioGroup>

          <Button onClick={handleSavePlatformFee} disabled={isSavingFee} shape="pill">
            {isSavingFee ? "Saving..." : "Save Fee Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {(["currentPassword", "newPassword", "confirmPassword"] as const).map((name) => (
                <FormField key={name} control={passwordForm.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {name === "currentPassword" ? "Current Password" : name === "newPassword" ? "New Password" : "Confirm Password"}
                    </FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
              <Button type="submit" variant="outline" disabled={isChangingPw}>
                {isChangingPw ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
