import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Palette, CreditCard, ArrowRight, ArrowLeft, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

const steps = [
  { id: 1, title: 'Upload Product', icon: Package, description: 'Add your first digital product' },
  { id: 2, title: 'Choose Theme', icon: Palette, description: 'Select your storefront style' },
  { id: 3, title: 'Select Plan', icon: CreditCard, description: 'Pick the right plan for you' },
];

const themes = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple', color: 'from-slate-400 to-slate-600', preview: 'bg-slate-100' },
  { id: 'modern', name: 'Modern', description: 'Bold and contemporary', color: 'from-primary to-secondary', preview: 'bg-primary/10' },
  { id: 'creative', name: 'Creative', description: 'Colorful and vibrant', color: 'from-purple-500 to-pink-500', preview: 'bg-purple-100' },
  { id: 'professional', name: 'Professional', description: 'Corporate and trustworthy', color: 'from-blue-600 to-cyan-500', preview: 'bg-blue-100' },
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
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [selectedPlan, setSelectedPlan] = useState('creator');
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      updateUser({ onboardingComplete: true });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return productData.title && productData.price;
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
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Skip for now
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

            {/* Step 2: Choose Theme */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Theme</h2>
                  <p className="text-muted-foreground">Select a storefront style that matches your brand.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {themes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTheme === theme.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedTheme === theme.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`h-24 rounded-lg bg-gradient-to-br ${theme.color} mb-4`} />
                      <h3 className="font-semibold text-foreground">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Plan */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Plan</h2>
                  <p className="text-muted-foreground">Choose the plan that fits your needs.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Creator Plan */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan('creator')}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                      selectedPlan === 'creator'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {selectedPlan === 'creator' && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-green-600 flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Creator Plan</h3>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      Free <span className="text-sm font-normal text-muted-foreground">+ 5% per sale</span>
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent-green" /> Unlimited products
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent-green" /> Basic storefront
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent-green" /> GST invoicing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent-green" /> UPI payments
                      </li>
                    </ul>
                  </motion.button>

                  {/* Startup Plan */}
                  <div className="relative p-6 rounded-xl border-2 border-border bg-muted/30 text-left opacity-75">
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent-orange text-white text-xs font-semibold">
                      Coming Soon
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-purple-600 flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Startup Plan</h3>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      ₹999<span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Everything in Creator
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Custom domain
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Priority support
                      </li>
                    </ul>
                  </div>
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
            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
