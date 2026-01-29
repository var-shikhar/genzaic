import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Store,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Package,
  ShoppingCart,
  Palette,
  Type,
  Link2,
  Save,
  Star,
  Users,
  Loader2,
  Instagram,
  Twitter,
  Youtube,
  Globe,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/ui/file-upload"
import { useAuth } from "@/contexts/AuthContext"
import { formatINR } from "@/lib/mockData"
import { storefrontAPI, type Storefront } from "@/lib/api/storefront"
import { toast } from "sonner"

const themes = [
  {
    id: "minimal",
    name: "Minimal",
    color: "from-slate-400 to-slate-600",
    bgColor: "#f8fafc",
  },
  {
    id: "modern",
    name: "Modern",
    color: "from-primary to-secondary",
    bgColor: "#073f7c",
  },
  {
    id: "creative",
    name: "Creative",
    color: "from-purple-500 to-pink-500",
    bgColor: "#8b5cf6",
  },
  {
    id: "professional",
    name: "Professional",
    color: "from-blue-600 to-cyan-500",
    bgColor: "#2563eb",
  },
  {
    id: "elegant",
    name: "Elegant Dark",
    color: "from-gray-800 to-gray-900",
    bgColor: "#1f2937",
  },
]

const fonts = [
  { id: "inter", name: "Inter", style: "font-sans" },
  { id: "poppins", name: "Poppins", style: "font-sans" },
  { id: "playfair", name: "Playfair Display", style: "font-serif" },
  { id: "roboto", name: "Roboto", style: "font-sans" },
  { id: "montserrat", name: "Montserrat", style: "font-sans" },
]

const colorPresets = [
  "#073f7c",
  "#1863a1",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#6366f1",
]

export default function StorefrontPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storefront, setStorefront] = useState<Storefront | null>(null)
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop")
  const [copied, setCopied] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Edit state
  const [storeName, setStoreName] = useState("")
  const [description, setDescription] = useState("")
  const [tagline, setTagline] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("modern")
  const [primaryColor, setPrimaryColor] = useState("#073f7c")
  const [selectedFont, setSelectedFont] = useState("Inter")

  // Files
  const [files, setFiles] = useState({
    profileImage: null as File | null,
    coverImage: null as File | null,
  })

  // Social links
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [youtube, setYoutube] = useState("")
  const [website, setWebsite] = useState("")

  const storeUrl = `${import.meta.env.VITE_APP_STORE_BASE_URL}/${
    storefront?.storeUrl || "creator"
  }`
  const publishedProducts = storefront?.products || []

  // Load storefront data
  useEffect(() => {
    loadStorefront()
  }, [])

  const loadStorefront = async () => {
    try {
      setLoading(true)
      const response = await storefrontAPI.getStorefront({
        includeProducts: true,
        productsLimit: 10,
      })
      const data = response.storefront

      setStorefront(data)
      setStoreName(data.storeName || "")
      setDescription(data.description || "")
      setTagline(data.tagline || `Digital products by ${user?.name}`)
      setSelectedTheme(data.themeId || "modern")
      setPrimaryColor(data.primaryColor || "#073f7c")
      setSelectedFont(data.fontFamily || "Inter")
      setInstagram(data.socialInstagram || "")
      setTwitter(data.socialTwitter || "")
      setYoutube(data.socialYoutube || "")
      setWebsite(data.socialWebsite || "")
    } catch (error) {
      toast.error("Failed to load storefront")
      console.error("Error loading storefront:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${storeUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Store URL copied to clipboard")
  }

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true)
      await storefrontAPI.updateStorefront(
        {
          storeName,
          description,
          tagline,
          themeId: selectedTheme,
          primaryColor,
          fontFamily: selectedFont,
          socialInstagram: instagram || null,
          socialTwitter: twitter || null,
          socialYoutube: youtube || null,
          socialWebsite: website || null,
        },
        {
          profileImage: files.profileImage || undefined,
          coverImage: files.coverImage || undefined,
        }
      )

      toast.success("Draft saved successfully")
      setHasChanges(false)
      loadStorefront() // Reload to get updated data
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft"
      toast.error(message)
      console.error("Error saving draft:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    try {
      setIsSubmitting(true)

      // Save changes first
      await storefrontAPI.updateStorefront(
        {
          storeName,
          description,
          tagline,
          themeId: selectedTheme,
          primaryColor,
          fontFamily: selectedFont,
          socialInstagram: instagram || null,
          socialTwitter: twitter || null,
          socialYoutube: youtube || null,
          socialWebsite: website || null,
        },
        {
          profileImage: files.profileImage || undefined,
          coverImage: files.coverImage || undefined,
        }
      )

      // Toggle publish status if not published
      if (!storefront?.isPublished) {
        await storefrontAPI.togglePublishStatus()
      }

      toast.success("Store published successfully!")
      setHasChanges(false)
      loadStorefront()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to publish store"
      toast.error(message)
      console.error("Error publishing store:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = () => {
    setHasChanges(true)
  }

  const getPreviewWidth = () => {
    switch (previewDevice) {
      case "mobile":
        return "w-[375px]"
      case "tablet":
        return "w-[768px]"
      default:
        return "w-full max-w-4xl"
    }
  }

  const currentTheme = themes.find((t) => t.id === selectedTheme) || themes[1]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storefront</h1>
            <p className="text-muted-foreground mt-1">
              Customize and preview your store
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {storefront && !storefront.isPublished && (
              <span className="text-sm text-orange-600 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                Unpublished
              </span>
            )}
            {hasChanges && (
              <span className="text-sm text-warning flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                Unsaved changes
              </span>
            )}
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {storeUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="p-1.5 rounded-md hover:bg-background border border-transparent hover:border-border transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-foreground" />
                )}
              </button>
            </div>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </Button>
            <Button
              className="gap-2 hover:opacity-90"
              onClick={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Publish Store
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Editing Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <Tabs defaultValue="store" className="w-full">
              <TabsList className="w-full grid grid-cols-4 rounded-none border-b border-border bg-muted/30">
                <TabsTrigger
                  value="store"
                  className="rounded-none data-[state=active]:bg-background"
                >
                  <Store className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  className="rounded-none data-[state=active]:bg-background"
                >
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="typography"
                  className="rounded-none data-[state=active]:bg-background"
                >
                  <Type className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="links"
                  className="rounded-none data-[state=active]:bg-background"
                >
                  <Link2 className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Store Info Tab */}
              <TabsContent value="store" className="p-6 space-y-6 mt-0">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Store Information
                  </h3>

                  {/* Profile Image */}
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Profile Photo
                    </Label>
                    <FileUpload
                      accept="image/*"
                      onChange={(file) => {
                        setFiles({ ...files, profileImage: file })
                        handleChange()
                      }}
                      value={files.profileImage}
                      label="Upload profile image"
                      maxSize={5}
                      preview={true}
                    />
                    {storefront?.profileImageUrl && !files.profileImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Current:
                        </span>
                        <img
                          src={storefront.profileImageUrl}
                          alt="Current profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Cover Image */}
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Cover Banner
                    </Label>
                    <FileUpload
                      accept="image/*"
                      onChange={(file) => {
                        setFiles({ ...files, coverImage: file })
                        handleChange()
                      }}
                      value={files.coverImage}
                      label="Upload cover image"
                      maxSize={10}
                      preview={true}
                    />
                    {storefront?.coverImageUrl && !files.coverImage && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground block mb-1">
                          Current:
                        </span>
                        <img
                          src={storefront.coverImageUrl}
                          alt="Current cover"
                          className="w-full h-24 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Store Name */}
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Store Name
                    </Label>
                    <Input
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value)
                        handleChange()
                      }}
                      placeholder="Your store name"
                    />
                  </div>

                  {/* Tagline */}
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Tagline
                    </Label>
                    <Input
                      value={tagline}
                      onChange={(e) => {
                        setTagline(e.target.value)
                        handleChange()
                      }}
                      placeholder="A short description of your store"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Theme Tab */}
              <TabsContent value="theme" className="p-6 space-y-6 mt-0">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Theme</h3>
                  <div className="space-y-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setSelectedTheme(theme.id)
                          handleChange()
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedTheme === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.color}`}
                        />
                        <span className="font-medium text-foreground">
                          {theme.name}
                        </span>
                        {selectedTheme === theme.id && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Accent Color
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setPrimaryColor(color)
                          handleChange()
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          primaryColor === color
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value)
                        handleChange()
                      }}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value)
                        handleChange()
                      }}
                      placeholder="#073f7c"
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="p-6 space-y-6 mt-0">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Font Family
                  </h3>
                  <div className="space-y-2">
                    {fonts.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => {
                          setSelectedFont(font.name)
                          handleChange()
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          selectedFont === font.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className={`text-lg ${font.style}`}>
                          {font.name}
                        </span>
                        {selectedFont === font.name && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Social Links Tab */}
              <TabsContent value="links" className="p-6 space-y-6 mt-0">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Social Links
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Instagram
                      </Label>
                      <Input
                        value={instagram}
                        onChange={(e) => {
                          setInstagram(e.target.value)
                          handleChange()
                        }}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Twitter / X
                      </Label>
                      <Input
                        value={twitter}
                        onChange={(e) => {
                          setTwitter(e.target.value)
                          handleChange()
                        }}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        YouTube
                      </Label>
                      <Input
                        value={youtube}
                        onChange={(e) => {
                          setYoutube(e.target.value)
                          handleChange()
                        }}
                        placeholder="Channel URL"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Website
                      </Label>
                      <Input
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value)
                          handleChange()
                        }}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "tablet"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`/store/${user?.storeUrl}`, "_blank")
                }
                className="gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                Open Store
              </Button>
            </div>

            {/* Preview Content */}
            <div className="p-6 bg-muted/30 min-h-[700px] flex justify-center overflow-auto">
              <div
                className={`bg-background rounded-xl shadow-lg overflow-hidden transition-all ${getPreviewWidth()}`}
                style={{ fontFamily: selectedFont }}
              >
                {/* Store Header with Cover */}
                <div
                  className="relative"
                  style={{ backgroundColor: currentTheme.bgColor }}
                >
                  {/* Cover Image */}
                  <div
                    className={`h-32 bg-gradient-to-br ${currentTheme.color} relative overflow-hidden`}
                  >
                    {(storefront?.coverImageUrl || files.coverImage) && (
                      <img
                        src={
                          files.coverImage
                            ? URL.createObjectURL(files.coverImage)
                            : storefront?.coverImageUrl || ""
                        }
                        alt="Cover"
                        className="w-full h-full object-cover opacity-80"
                      />
                    )}
                  </div>

                  {/* Profile Section */}
                  <div className="px-6 pb-6 -mt-10 relative">
                    <div className="flex items-end gap-4">
                      <div
                        className="w-20 h-20 rounded-full border-4 border-background flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {storefront?.profileImageUrl || files.profileImage ? (
                          <img
                            src={
                              files.profileImage
                                ? URL.createObjectURL(files.profileImage)
                                : storefront?.profileImageUrl || ""
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {storeName?.charAt(0) || "G"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <h1
                          className="text-xl font-bold"
                          style={{
                            color:
                              currentTheme.id === "minimal"
                                ? "#1f2937"
                                : "#f9fafb",
                          }}
                        >
                          {storeName || "Creator Store"}
                        </h1>
                        <p
                          className="text-sm"
                          style={{
                            color:
                              currentTheme.id === "minimal"
                                ? "#6b7280"
                                : "#d1d5db",
                          }}
                        >
                          {tagline}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div
                      className="flex items-center gap-6 mt-4 text-sm"
                      style={{
                        color:
                          currentTheme.id === "minimal" ? "#6b7280" : "#d1d5db",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="font-medium">
                          {user?.rating || 4.8}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users
                          className="w-4 h-4"
                          style={{
                            color:
                              currentTheme.id === "minimal"
                                ? "#9ca3af"
                                : "#9ca3af",
                          }}
                        />
                        <span>{user?.followers || 125} followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package
                          className="w-4 h-4"
                          style={{
                            color:
                              currentTheme.id === "minimal"
                                ? "#9ca3af"
                                : "#9ca3af",
                          }}
                        />
                        <span>{publishedProducts.length} products</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(instagram || twitter || youtube || website) && (
                      <div className="flex items-center gap-3 mt-4">
                        {instagram && (
                          <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Instagram
                              className="w-4 h-4"
                              style={{
                                color:
                                  currentTheme.id === "minimal"
                                    ? "#6b7280"
                                    : "#d1d5db",
                              }}
                            />
                          </div>
                        )}
                        {twitter && (
                          <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Twitter
                              className="w-4 h-4"
                              style={{
                                color:
                                  currentTheme.id === "minimal"
                                    ? "#6b7280"
                                    : "#d1d5db",
                              }}
                            />
                          </div>
                        )}
                        {youtube && (
                          <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Youtube
                              className="w-4 h-4"
                              style={{
                                color:
                                  currentTheme.id === "minimal"
                                    ? "#6b7280"
                                    : "#d1d5db",
                              }}
                            />
                          </div>
                        )}
                        {website && (
                          <div className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                            <Globe
                              className="w-4 h-4"
                              style={{
                                color:
                                  currentTheme.id === "minimal"
                                    ? "#6b7280"
                                    : "#d1d5db",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Products Grid */}
                <div
                  className="p-6"
                  style={{
                    backgroundColor:
                      currentTheme.id === "minimal"
                        ? "#f8fafc"
                        : currentTheme.bgColor,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="font-semibold"
                      style={{
                        color:
                          currentTheme.id === "minimal" ? "#1f2937" : "#f9fafb",
                      }}
                    >
                      Products
                    </h2>
                    <span
                      className="text-sm"
                      style={{
                        color:
                          currentTheme.id === "minimal" ? "#6b7280" : "#d1d5db",
                      }}
                    >
                      Sort: Popular
                    </span>
                  </div>
                  <div
                    className={`grid gap-4 ${
                      previewDevice === "mobile"
                        ? "grid-cols-1"
                        : previewDevice === "tablet"
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {publishedProducts.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          {product.hasDiscount && (
                            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3
                            className="font-medium text-sm line-clamp-1"
                            style={{
                              color:
                                currentTheme.id === "minimal"
                                  ? "#1f2937"
                                  : currentTheme.id === "elegant"
                                  ? "#f9fafb"
                                  : currentTheme.bgColor === "#073f7c" ||
                                    currentTheme.bgColor === "#8b5cf6" ||
                                    currentTheme.bgColor === "#2563eb" ||
                                    currentTheme.bgColor === "#1f2937"
                                  ? "#f9fafb"
                                  : "#1f2937",
                            }}
                          >
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span className="text-xs text-muted-foreground">
                              {product.rating} ({product.reviewCount})
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-bold"
                                style={{
                                  color:
                                    currentTheme.id === "minimal"
                                      ? "#1f2937"
                                      : currentTheme.id === "elegant"
                                      ? "#f9fafb"
                                      : currentTheme.bgColor === "#073f7c" ||
                                        currentTheme.bgColor === "#8b5cf6" ||
                                        currentTheme.bgColor === "#2563eb" ||
                                        currentTheme.bgColor === "#1f2937"
                                      ? "#f9fafb"
                                      : "#1f2937",
                                }}
                              >
                                {formatINR(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span
                                  className="text-xs line-through"
                                  style={{ color: "#9ca3af" }}
                                >
                                  {formatINR(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <button
                              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Buy
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">
                    Powered by{" "}
                    <span className="font-semibold text-primary">GenZaic</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
