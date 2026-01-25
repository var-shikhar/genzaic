import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Palette,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  X,
  Pipette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { onboardingAPI } from "@/lib/api/onboarding"
import { kycAPI } from "@/lib/api/kyc"
import { toast } from "sonner"
import { FileUpload } from "@/components/ui/file-upload"

const steps = [
  {
    id: 1,
    title: "Upload Product",
    icon: Package,
    description: "Add your first digital product",
  },
  {
    id: 2,
    title: "Setup Store",
    icon: Palette,
    description: "Customize your storefront",
  },
  {
    id: 3,
    title: "Add Payment",
    icon: Wallet,
    description: "Connect your payment method",
  },
]

const themes = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and simple",
    color: "from-slate-400 to-slate-600",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold and contemporary",
    color: "from-primary to-secondary",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colorful and vibrant",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate and trustworthy",
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined and luxurious",
    color: "from-amber-500 to-yellow-400",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Fresh and organic",
    color: "from-green-500 to-emerald-400",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm and inviting",
    color: "from-orange-500 to-red-400",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm and serene",
    color: "from-teal-500 to-blue-400",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark and mysterious",
    color: "from-indigo-600 to-purple-800",
  },
  {
    id: "candy",
    name: "Candy",
    description: "Playful and fun",
    color: "from-pink-400 to-rose-500",
  },
]

const colorOptions = [
  { id: "orange", name: "Orange", color: "#f97316" },
  { id: "blue", name: "Blue", color: "#3b82f6" },
  { id: "green", name: "Green", color: "#22c55e" },
  { id: "purple", name: "Purple", color: "#a855f7" },
  { id: "pink", name: "Pink", color: "#ec4899" },
  { id: "teal", name: "Teal", color: "#14b8a6" },
  { id: "red", name: "Red", color: "#ef4444" },
  { id: "yellow", name: "Yellow", color: "#eab308" },
  { id: "indigo", name: "Indigo", color: "#6366f1" },
  { id: "cyan", name: "Cyan", color: "#06b6d4" },
  { id: "emerald", name: "Emerald", color: "#10b981" },
  { id: "rose", name: "Rose", color: "#f43f5e" },
]

const fontOptions = [
  { id: "dm-sans", name: "DM Sans", style: "font-dm-sans" },
  { id: "montserrat", name: "Montserrat", style: "font-montserrat" },
  { id: "nunito", name: "Nunito", style: "font-nunito" },
  { id: "open-sans", name: "Open Sans", style: "font-open-sans" },
  { id: "outfit", name: "Outfit", style: "font-outfit" },
  { id: "quicksand", name: "Quicksand", style: "font-quicksand" },
  { id: "raleway", name: "Raleway", style: "font-raleway" },
  { id: "source-sans", name: "Source Sans", style: "font-source-sans" },
  { id: "space-grotesk", name: "Space Grotesk", style: "font-space-grotesk" },
  { id: "lora", name: "Lora", style: "font-lora" },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: "",
    file: null as File | null,
    thumbnail: null as File | null,
    seoTitle: "",
    seoKeywords: "",
  })
  const [storeData, setStoreData] = useState({
    storeName: "",
    storeDescription: "",
    logo: null as File | null,
    selectedTheme: "modern",
    selectedColor: "orange",
    customColor: "",
    selectedFont: "dm-sans",
  })
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "bank" as "bank" | "upi",
    documentType: "pan" as "pan" | "aadhaar",
    panNumber: "",
    aadhaarNumber: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  })
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  // Load existing KYC data if available (for editing)
  React.useEffect(() => {
    const loadExistingKycData = async () => {
      try {
        const kycResponse = await kycAPI.getKyc()
        if (kycResponse.kyc) {
          const kyc = kycResponse.kyc
          setPaymentData(prev => ({
            ...prev,
            documentType: kyc.documentType,
            panNumber: kyc.panNumber || "",
            aadhaarNumber: kyc.aadhaarNumber || "",
            accountHolderName: kyc.accountHolderName,
            accountNumber: kyc.accountNumber,
            ifscCode: kyc.ifscCode,
            bankName: kyc.bankName,
          }))
        }
      } catch (error) {
        // No existing KYC data, that's fine
        console.log("No existing KYC data to load")
      }
    }
    loadExistingKycData()
  }, [])

  // Helper to get hex color from color ID
  const getColorHex = (colorId: string): string => {
    const colorMap: Record<string, string> = {
      orange: "#f97316",
      blue: "#3b82f6",
      green: "#22c55e",
      purple: "#a855f7",
      pink: "#ec4899",
      teal: "#14b8a6",
      red: "#ef4444",
      yellow: "#eab308",
      indigo: "#6366f1",
      cyan: "#06b6d4",
      emerald: "#10b981",
      rose: "#f43f5e",
    }
    return colorMap[colorId] || "#6366f1"
  }

  const handleNext = async () => {
    try {
      setIsLoading(true)

      if (currentStep === 1) {
        // Step 1: Create product
        const files = {
          productFile: productData.file || undefined,
          thumbnail: productData.thumbnail || undefined,
        }
        
        const response = await onboardingAPI.createFirstProduct(
          {
            title: productData.title,
            price: parseFloat(productData.price),
            description: productData.description || undefined,
            seoTitle: productData.seoTitle || undefined,
            seoKeywords: productData.seoKeywords || undefined,
          },
          files
        )

        if (response.success) {
          toast.success("Product created successfully!")
          setCurrentStep(2)
        }
      } else if (currentStep === 2) {
        // Step 2: Update storefront
        const primaryColor =
          storeData.customColor || getColorHex(storeData.selectedColor)
        const response = await onboardingAPI.updateStorefrontSettings(
          {
            storeName: storeData.storeName,
            storeDescription: storeData.storeDescription || undefined,
            tagline: `Digital products by ${storeData.storeName}`,
            themeId: storeData.selectedTheme as any,
            primaryColor,
            fontFamily: storeData.selectedFont as any,
          },
          {
            profileImage: storeData.logo || undefined,
          }
        )

        if (response.success) {
          toast.success("Storefront settings saved!")
          setCurrentStep(3)
        }
      } else if (currentStep === 3) {
        // Step 3: Update payment (now includes KYC fields for bank)
        const response = await onboardingAPI.updatePaymentInfo({
          paymentMethod: paymentData.paymentMethod,
          documentType:
            paymentData.paymentMethod === "bank"
              ? paymentData.documentType
              : undefined,
          panNumber:
            paymentData.paymentMethod === "bank" && paymentData.documentType === "pan"
              ? paymentData.panNumber
              : undefined,
          aadhaarNumber:
            paymentData.paymentMethod === "bank" && paymentData.documentType === "aadhaar"
              ? paymentData.aadhaarNumber
              : undefined,
          accountHolderName:
            paymentData.paymentMethod === "bank"
              ? paymentData.accountHolderName
              : undefined,
          accountNumber:
            paymentData.paymentMethod === "bank"
              ? paymentData.accountNumber
              : undefined,
          ifscCode:
            paymentData.paymentMethod === "bank"
              ? paymentData.ifscCode
              : undefined,
          bankName:
            paymentData.paymentMethod === "bank"
              ? paymentData.bankName
              : undefined,
          upiId:
            paymentData.paymentMethod === "upi" ? paymentData.upiId : undefined,
        })

        if (response.success) {
          toast.success("Payment information saved!")
          navigate("/plan-selection")
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipStep = async () => {
    // Skip only the current step, move to next
    try {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        // On last step, skip entirely and go to plan selection
        await onboardingAPI.skipOnboarding()
        navigate("/plan-selection")
      }
    } catch (error) {
      // If skip fails, just navigate anyway
      navigate("/plan-selection")
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return productData.title && productData.price
    }
    if (currentStep === 2) {
      return storeData.storeName
    }
    if (currentStep === 3) {
      if (paymentData.paymentMethod === "bank") {
        const hasDocumentNumber =
          paymentData.documentType === "pan"
            ? !!paymentData.panNumber
            : !!paymentData.aadhaarNumber
        return (
          hasDocumentNumber &&
          paymentData.accountHolderName &&
          paymentData.accountNumber &&
          paymentData.ifscCode &&
          paymentData.bankName
        )
      }
      return paymentData.upiId
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl text-foreground">GenZaic</span>
          </div>
          <Button variant="ghost" onClick={handleSkipStep}>
            Skip this step
          </Button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`font-semibold ${
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded-full ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border border-border p-8 shadow-card"
          >
            {/* Step 1: Upload Product */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Upload Your First Product
                  </h2>
                  <p className="text-muted-foreground">
                    Add a digital product to get started with your store.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Product Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Ultimate UI Kit"
                        value={productData.title}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="499"
                        value={productData.price}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product..."
                        rows={4}
                        value={productData.description}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Product File (PDF/ZIP)</Label>
                      <FileUpload
                        accept=".pdf,.zip,.rar,.7z,application/pdf,application/zip"
                        onChange={(file) =>
                          setProductData({ ...productData, file })
                        }
                        value={productData.file}
                        label="Upload product file (PDF, ZIP, etc.)"
                        maxSize={10}
                        preview={false}
                      />
                    </div>
                    <div>
                      <Label>Product Thumbnail</Label>
                      <FileUpload
                        accept="image/*"
                        onChange={(file) =>
                          setProductData({ ...productData, thumbnail: file })
                        }
                        value={productData.thumbnail}
                        label="Upload product thumbnail"
                        maxSize={10}
                        preview={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">
                    SEO Settings (Optional)
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        placeholder="SEO optimized title"
                        value={productData.seoTitle}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            seoTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="seoKeywords">Keywords</Label>
                      <Input
                        id="seoKeywords"
                        placeholder="ui kit, design, templates"
                        value={productData.seoKeywords}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            seoKeywords: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Setup Store */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Setup Your Store
                  </h2>
                  <p className="text-muted-foreground">
                    Customize your storefront to match your brand.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">Store Name *</Label>
                      <Input
                        id="storeName"
                        placeholder="e.g., Design Studio"
                        value={storeData.storeName}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            storeName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeDescription">
                        Store Description
                      </Label>
                      <Textarea
                        id="storeDescription"
                        placeholder="Tell customers what your store is about..."
                        rows={3}
                        value={storeData.storeDescription}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            storeDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Store Logo</Label>
                      <FileUpload
                        accept="image/*"
                        onChange={(file) =>
                          setStoreData({ ...storeData, logo: file })
                        }
                        value={storeData.logo}
                        label="Upload store logo"
                        maxSize={10}
                        preview={true}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Theme Style</Label>
                      <ScrollArea className="mt-2 w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-3">
                          {themes.map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() =>
                                setStoreData({
                                  ...storeData,
                                  selectedTheme: theme.id,
                                })
                              }
                              className={`relative flex-shrink-0 w-28 p-3 rounded-lg border-2 text-left transition-all ${
                                storeData.selectedTheme === theme.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {storeData.selectedTheme === theme.id && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div
                                className={`h-8 rounded bg-gradient-to-br ${theme.color} mb-2`}
                              />
                              <p className="text-xs font-medium text-foreground truncate">
                                {theme.name}
                              </p>
                            </button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>

                    <div>
                      <Label>Brand Color</Label>
                      <ScrollArea className="mt-2 w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-3">
                          {colorOptions.map((colorOpt) => (
                            <button
                              key={colorOpt.id}
                              onClick={() =>
                                setStoreData({
                                  ...storeData,
                                  selectedColor: colorOpt.id,
                                  customColor: "",
                                })
                              }
                              style={{ backgroundColor: colorOpt.color }}
                              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                storeData.selectedColor === colorOpt.id &&
                                !storeData.customColor
                                  ? "ring-2 ring-offset-2 ring-primary"
                                  : "hover:scale-110"
                              }`}
                            >
                              {storeData.selectedColor === colorOpt.id &&
                                !storeData.customColor && (
                                  <Check className="w-5 h-5 text-white" />
                                )}
                            </button>
                          ))}
                          {/* Custom Color Picker */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                                  storeData.customColor
                                    ? "ring-2 ring-offset-2 ring-primary border-solid"
                                    : "border-border hover:border-primary/50"
                                }`}
                                style={
                                  storeData.customColor
                                    ? {
                                        backgroundColor: storeData.customColor,
                                        borderColor: storeData.customColor,
                                      }
                                    : {}
                                }
                              >
                                {storeData.customColor ? (
                                  <Check className="w-5 h-5 text-white" />
                                ) : (
                                  <Pipette className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-3"
                              align="start"
                            >
                              <div className="space-y-2">
                                <Label className="text-xs">Custom Color</Label>
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="color"
                                    value={storeData.customColor || "#000000"}
                                    onChange={(e) =>
                                      setStoreData({
                                        ...storeData,
                                        customColor: e.target.value,
                                        selectedColor: "",
                                      })
                                    }
                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                  />
                                  <Input
                                    value={storeData.customColor}
                                    onChange={(e) =>
                                      setStoreData({
                                        ...storeData,
                                        customColor: e.target.value,
                                        selectedColor: "",
                                      })
                                    }
                                    placeholder="#000000"
                                    className="w-24 h-8 text-xs"
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>

                    <div>
                      <Label>Font Style</Label>
                      <ScrollArea className="mt-2 w-full whitespace-nowrap">
                        <div className="flex gap-2 pb-3">
                          {fontOptions.map((font) => (
                            <button
                              key={font.id}
                              onClick={() =>
                                setStoreData({
                                  ...storeData,
                                  selectedFont: font.id,
                                })
                              }
                              className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 text-center transition-all ${
                                font.style
                              } ${
                                storeData.selectedFont === font.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <span className="text-foreground font-medium whitespace-nowrap">
                                {font.name}
                              </span>
                            </button>
                          ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Add Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Add Payment Method
                  </h2>
                  <p className="text-muted-foreground">
                    Connect your payment method to receive payouts.
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      setPaymentData({ ...paymentData, paymentMethod: "bank" })
                    }
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentData.paymentMethod === "bank"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-foreground" />
                    <p className="font-semibold text-foreground">
                      Bank Account
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Direct bank transfer
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      setPaymentData({ ...paymentData, paymentMethod: "upi" })
                    }
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentData.paymentMethod === "upi"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">UPI</span>
                    </div>
                    <p className="font-semibold text-foreground">UPI ID</p>
                    <p className="text-sm text-muted-foreground">
                      Instant UPI transfer
                    </p>
                  </button>
                </div>

                {/* Bank Account Form - Now includes KYC details */}
                {paymentData.paymentMethod === "bank" && (
                  <div className="space-y-4">
                    {/* Document Type Selection */}
                    <div>
                      <Label>Identity Document Type *</Label>
                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentData({ ...paymentData, documentType: "pan" })
                          }
                          className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                            paymentData.documentType === "pan"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="font-semibold text-foreground">PAN Card</p>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPaymentData({ ...paymentData, documentType: "aadhaar" })
                          }
                          className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                            paymentData.documentType === "aadhaar"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="font-semibold text-foreground">Aadhaar Card</p>
                        </button>
                      </div>
                    </div>

                    {/* Document Number */}
                    {paymentData.documentType === "pan" ? (
                      <div>
                        <Label htmlFor="panNumber">PAN Number *</Label>
                        <Input
                          id="panNumber"
                          placeholder="ABCDE1234F"
                          value={paymentData.panNumber}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              panNumber: e.target.value.toUpperCase(),
                            })
                          }
                          maxLength={10}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                        <Input
                          id="aadhaarNumber"
                          placeholder="XXXX XXXX XXXX"
                          value={paymentData.aadhaarNumber}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              aadhaarNumber: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          maxLength={12}
                        />
                      </div>
                    )}

                    {/* Bank Account Details */}
                    <div>
                      <Label htmlFor="accountHolderName">
                        Account Holder Name *
                      </Label>
                      <Input
                        id="accountHolderName"
                        placeholder="As per bank records"
                        value={paymentData.accountHolderName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            accountHolderName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">
                        Account Number *
                      </Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter account number"
                        value={paymentData.accountNumber}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            accountNumber: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        placeholder="e.g., SBIN0001234"
                        value={paymentData.ifscCode}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            ifscCode: e.target.value.toUpperCase(),
                          })
                        }
                        maxLength={11}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., State Bank of India"
                        value={paymentData.bankName}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            bankName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* UPI Form */}
                {paymentData.paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={paymentData.upiId}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            upiId: e.target.value,
                          })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter your UPI ID linked to any UPI app (Google Pay,
                      PhonePe, Paytm, etc.)
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/30">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">🔒 Secure & Verified:</span>{" "}
                    Your payment details are encrypted and stored securely.
                    Payouts are processed within T+7 days.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="gap-2  hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentStep === 3 ? "Continue to Plan" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
