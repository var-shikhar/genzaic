import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Palette, Wallet, ArrowRight, ArrowLeft, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

const steps = [
  { id: 1, title: 'Upload Product', icon: Package, description: 'Add your first digital product' },
  { id: 2, title: 'Setup Store', icon: Palette, description: 'Customize your storefront' },
  { id: 3, title: 'Add Payment', icon: Wallet, description: 'Connect your payment method' },
];

const themes = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple', color: 'from-slate-400 to-slate-600' },
  { id: 'modern', name: 'Modern', description: 'Bold and contemporary', color: 'from-primary to-secondary' },
  { id: 'creative', name: 'Creative', description: 'Colorful and vibrant', color: 'from-purple-500 to-pink-500' },
  { id: 'professional', name: 'Professional', description: 'Corporate and trustworthy', color: 'from-blue-600 to-cyan-500' },
];

const colorOptions = [
  { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'green', name: 'Green', color: 'bg-green-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
  { id: 'pink', name: 'Pink', color: 'bg-pink-500' },
  { id: 'teal', name: 'Teal', color: 'bg-teal-500' },
];

const fontOptions = [
  { id: 'inter', name: 'Inter', style: 'font-sans' },
  { id: 'poppins', name: 'Poppins', style: 'font-sans' },
  { id: 'playfair', name: 'Playfair', style: 'font-serif' },
  { id: 'roboto', name: 'Roboto', style: 'font-sans' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    file: null as File | null,
    thumbnail: null as File | null,
    seoTitle: '',
    seoKeywords: '',
  });
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeDescription: '',
    logo: null as File | null,
    selectedTheme: 'modern',
    selectedColor: 'orange',
    selectedFont: 'inter',
  });
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'bank' as 'bank' | 'upi',
    bankAccountName: '',
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding, go to plan selection
      navigate('/plan-selection');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    // Skip only the current step, move to next
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, go to plan selection
      navigate('/plan-selection');
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return productData.title && productData.price;
    }
    if (currentStep === 2) {
      return storeData.storeName;
    }
    if (currentStep === 3) {
      if (paymentData.paymentMethod === 'bank') {
        return paymentData.bankAccountName && paymentData.bankAccountNumber && paymentData.ifscCode;
      }
      return paymentData.upiId;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? 'bg-gradient-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`font-semibold ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your First Product</h2>
                  <p className="text-muted-foreground">Add a digital product to get started with your store.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Product Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Ultimate UI Kit"
                        value={productData.title}
                        onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="499"
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product..."
                        rows={4}
                        value={productData.description}
                        onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Product File (PDF/ZIP)</Label>
                      <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {productData.file ? productData.file.name : 'Click to upload or drag and drop'}
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.zip"
                          onChange={(e) => setProductData({ ...productData, file: e.target.files?.[0] || null })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cover Image</Label>
                      <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {productData.thumbnail ? productData.thumbnail.name : 'Upload cover image'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">SEO Settings (Optional)</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <Input
                        id="seoTitle"
                        placeholder="SEO optimized title"
                        value={productData.seoTitle}
                        onChange={(e) => setProductData({ ...productData, seoTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seoKeywords">Keywords</Label>
                      <Input
                        id="seoKeywords"
                        placeholder="ui kit, design, templates"
                        value={productData.seoKeywords}
                        onChange={(e) => setProductData({ ...productData, seoKeywords: e.target.value })}
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Setup Your Store</h2>
                  <p className="text-muted-foreground">Customize your storefront to match your brand.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">Store Name *</Label>
                      <Input
                        id="storeName"
                        placeholder="e.g., Design Studio"
                        value={storeData.storeName}
                        onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <Textarea
                        id="storeDescription"
                        placeholder="Tell customers what your store is about..."
                        rows={3}
                        value={storeData.storeDescription}
                        onChange={(e) => setStoreData({ ...storeData, storeDescription: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Store Logo</Label>
                      <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {storeData.logo ? storeData.logo.name : 'Upload your logo'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Theme Style</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setStoreData({ ...storeData, selectedTheme: theme.id })}
                            className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                              storeData.selectedTheme === theme.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {storeData.selectedTheme === theme.id && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className={`h-8 rounded bg-gradient-to-br ${theme.color} mb-2`} />
                            <p className="text-xs font-medium text-foreground">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Brand Color</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setStoreData({ ...storeData, selectedColor: color.id })}
                            className={`w-10 h-10 rounded-lg ${color.color} flex items-center justify-center transition-all ${
                              storeData.selectedColor === color.id
                                ? 'ring-2 ring-offset-2 ring-primary'
                                : 'hover:scale-110'
                            }`}
                          >
                            {storeData.selectedColor === color.id && (
                              <Check className="w-5 h-5 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Font Style</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {fontOptions.map((font) => (
                          <button
                            key={font.id}
                            onClick={() => setStoreData({ ...storeData, selectedFont: font.id })}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${font.style} ${
                              storeData.selectedFont === font.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-foreground font-medium">{font.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Add Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Add Payment Method</h2>
                  <p className="text-muted-foreground">Connect your payment method to receive payouts.</p>
                </div>

                {/* Payment Method Selection */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentData({ ...paymentData, paymentMethod: 'bank' })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentData.paymentMethod === 'bank'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-foreground" />
                    <p className="font-semibold text-foreground">Bank Account</p>
                    <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                  </button>
                  <button
                    onClick={() => setPaymentData({ ...paymentData, paymentMethod: 'upi' })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentData.paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">UPI</span>
                    </div>
                    <p className="font-semibold text-foreground">UPI ID</p>
                    <p className="text-sm text-muted-foreground">Instant UPI transfer</p>
                  </button>
                </div>

                {/* Bank Account Form */}
                {paymentData.paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankAccountName">Account Holder Name *</Label>
                      <Input
                        id="bankAccountName"
                        placeholder="As per bank records"
                        value={paymentData.bankAccountName}
                        onChange={(e) => setPaymentData({ ...paymentData, bankAccountName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccountNumber">Account Number *</Label>
                      <Input
                        id="bankAccountNumber"
                        placeholder="Enter account number"
                        value={paymentData.bankAccountNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, bankAccountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        placeholder="e.g., SBIN0001234"
                        value={paymentData.ifscCode}
                        onChange={(e) => setPaymentData({ ...paymentData, ifscCode: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                )}

                {/* UPI Form */}
                {paymentData.paymentMethod === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upiId">UPI ID *</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        value={paymentData.upiId}
                        onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter your UPI ID linked to any UPI app (Google Pay, PhonePe, Paytm, etc.)
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-accent-green/10 border border-accent-green/30">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">🔒 Secure & Verified:</span> Your payment details are encrypted and stored securely. Payouts are processed within T+7 days.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-primary hover:opacity-90"
          >
            {currentStep === 3 ? 'Continue to Plan' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
