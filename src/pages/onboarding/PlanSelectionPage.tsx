import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Bell, Sparkles, BarChart3, Users, Palette, TrendingUp, Heart, Megaphone, LayoutGrid, Plug, Globe, Boxes, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { onboardingAPI } from '@/lib/api/onboarding';
import { toast } from "@/lib/toast";

export default function PlanSelectionPage() {
  const [selectedPlan, setSelectedPlan] = useState<'creator' | null>('creator');
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSelectCreator = () => {
    setSelectedPlan('creator');
  };

  const handleContinue = async () => {
    if (selectedPlan === 'creator') {
      try {
        setIsProcessing(true);

        // Step 1: Select plan
        const planResponse = await onboardingAPI.selectPlan({ planType: 'creator' });

        if (planResponse.success) {
          // Step 2: Complete onboarding
          const completeResponse = await onboardingAPI.completeOnboarding();

          if (completeResponse.success) {
            // Update user in AuthContext
            updateUser({
              onboardingComplete: true,
              planType: 'creator',
            });

            toast.success('Welcome to GenZaic Creator Hub!');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail) {
      toast.success('You\'re on the list!');
      setNotifyDialogOpen(false);
      setNotifyEmail('');
    }
  };

  const creatorBenefits = [
    { icon: Check, text: 'Unlimited Products', tooltip: 'List as many digital products as you want with no restrictions' },
    { icon: Check, text: 'Unlimited Sales', tooltip: 'Sell without any caps or limits on your earnings' },
    { icon: Check, text: 'T+7 Bank Payouts', tooltip: 'Receive your earnings directly to your bank account within 7 days of each sale' },
    { icon: Check, text: 'GST Invoicing', tooltip: 'Automated GST-compliant invoices with calculated GST and TDS for every transaction' },
    { icon: Check, text: 'Community Access', tooltip: 'Join our creator community to connect, learn, and grow together' },
    { icon: Check, text: 'Customer Reviews & Ratings', tooltip: 'Build trust with customer reviews and ratings on your products' },
    { icon: Check, text: 'Basic Analytics', tooltip: 'Track your sales, views, and customer insights' },
    { icon: Check, text: 'UPI & Bank Payments', tooltip: 'Accept payments via UPI and direct bank transfers from your customers' },
  ];

  const startupBenefits = [
    { icon: Sparkles, text: 'Everything in Creator', tooltip: 'All features from the Creator plan included' },
    { icon: BarChart3, text: 'Advanced Analytics', tooltip: 'Deep insights into customer behavior, conversion rates, and revenue trends' },
    { icon: Users, text: 'Team Access', tooltip: 'Invite team members to help manage your store' },
    { icon: Palette, text: 'Storefront Customization', tooltip: 'Advanced design options to match your brand identity' },
    { icon: LayoutGrid, text: 'Drag & Drop Storefront', tooltip: 'Easily build and customize your store with drag and drop' },
    { icon: TrendingUp, text: 'Sales Funnel', tooltip: 'Create optimized sales funnels to maximize conversions' },
    { icon: Megaphone, text: 'Marketing Tools', tooltip: 'Built-in email marketing, discount codes, and promotional tools' },
    { icon: Plug, text: 'Integrations', tooltip: 'Connect with popular tools and services' },
    { icon: Globe, text: 'Custom Domain', tooltip: 'Use your own domain name for your store' },
    { icon: Boxes, text: 'Apps & Add-ons', tooltip: 'Extend functionality with apps and add-ons' },
    { icon: Heart, text: 'Loyalty Program', tooltip: 'Reward your repeat customers with loyalty points' },
    { icon: Check, text: 'Priority Support', tooltip: 'Get faster responses from our support team' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Genzaic" width={110} height={22} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with zero upfront cost. Pay only when you earn.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Creator Plan */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSelectCreator}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'creator'
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              {selectedPlan === 'creator' && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Creator Plan</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">₹0</span>
                  <span className="text-muted-foreground">Setup Fee</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-accent-orange/10 text-accent-orange text-sm font-semibold">
                  25% Per Sale
                </div>
              </div>

              <ul className="space-y-3">
                {creatorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3 h-3 text-accent-green" />
                    </div>
                    <span className="flex-1">{benefit.text}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          type="button" 
                          className="p-0.5 rounded-full hover:bg-muted transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="center" className="max-w-xs">
                        <p>{benefit.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Startup Plan - Coming Soon */}
            <div className="relative p-6 pt-8 rounded-2xl border-2 border-border bg-card overflow-visible">
              {/* Coming Soon Badge at Top Center - Half inside, half outside */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-800 text-white text-sm font-semibold shadow-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Coming Soon
                </div>
              </div>
              
              {/* Light Overlay - Less Blurry */}
              <div className="absolute inset-0 bg-background/30 z-10 pointer-events-none" />
              
              <div className="mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Startup Plan</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-muted-foreground">₹XXX</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                  2.5% Commission
                </div>
              </div>

              <ul className="space-y-3 mb-6 mt-8">
                {startupBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-foreground/70">
                    <div className="w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3 h-3 text-accent-purple" />
                    </div>
                    <span className="flex-1">{benefit.text}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          type="button" 
                          className="p-0.5 rounded-full hover:bg-muted transition-colors relative z-20"
                        >
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" align="center" className="max-w-xs">
                        <p>{benefit.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="w-full gap-2 relative z-20"
                onClick={() => setNotifyDialogOpen(true)}
              >
                <Bell className="w-4 h-4" />
                Notify Me When Available
              </Button>
            </div>
          </div>

          {/* Continue Button & Info */}
          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-lg font-medium text-foreground">
                      We're getting things ready for you...
                    </span>
                  </div>
                  <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!selectedPlan}
                    className="w-full sm:w-auto gap-2 px-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/40 disabled:text-primary-foreground/60 disabled:cursor-not-allowed"
                  >
                    {selectedPlan ? 'Continue to Dashboard' : 'Select a Plan to Continue'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <p className="text-sm text-muted-foreground">
              No credit card required.
            </p>
          </div>
        </div>

        {/* Notify Dialog */}
        <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Get Notified</DialogTitle>
              <DialogDescription>
                Enter your email to be notified when the Startup plan becomes available.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleNotifySubmit} className="space-y-4">
              <div>
                <Label htmlFor="notify-email">Email Address</Label>
                <Input
                  id="notify-email"
                  type="email"
                  placeholder="you@example.com"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setNotifyDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Notify Me
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
