"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Lock, Bell, Store } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useProfile, useUpdateProfile } from "@/lib/queries/user"
import { getApiErrorMessage } from "@/lib/api-error"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export default function BuyerSettingsPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const { data: profile, isLoading } = useProfile()
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()

  const [name, setName] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Sync name from profile on load
  if (profile && name === "" && profile.name) {
    setName(profile.name)
  }

  const handleSaveProfile = async () => {
    const formData = new FormData()
    formData.append("name", name)
    if (avatarFile) formData.append("avatar", avatarFile)
    try {
      const updated = await updateProfile(formData)
      await update({ name: updated.name, image: updated.avatarUrl })
      setAvatarFile(null)
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update profile"))
    }
  }

  const handleBecomeSeller = () => {
    toast.success("Redirecting to seller onboarding...")
    router.push("/onboarding")
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const currentProfile = profile
  const isSeller = (session?.user as Record<string, unknown>)?.isSeller ?? currentProfile?.isSeller ?? false

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={avatarPreview ?? currentProfile?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {(currentProfile?.name ?? session?.user?.name ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>Change Avatar</span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) {
                          setAvatarFile(f)
                          setAvatarPreview(URL.createObjectURL(f))
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentProfile?.email ?? session?.user?.email ?? ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about your purchases and downloads
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new products and offers
                  </p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Become a Seller */}
        {!isSeller && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Start Selling on GenZaic</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Turn your digital products into income. Set up your store in minutes.
                    </p>
                  </div>
                  <Button onClick={handleBecomeSeller}>
                    <Store className="w-4 h-4 mr-2" />
                    Start Selling
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and security</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => router.push("/forgot-password")}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
