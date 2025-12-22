import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Bell, X, Sparkles, BarChart3, Users, Palette, TrendingUp, Heart, Megaphone } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function PlanSelectionPage() {
  const [selectedPlan, setSelectedPlan] = useState<'creator' | null>(null);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { toast } = useToast();

  const handleSelectCreator = () => {
    setSelectedPlan('creator');
  };

  const handleContinue = () => {
    if (selectedPlan === 'creator') {
      updateUser({ onboardingComplete: true });
      toast({
        title: "Welcome to GenZaic!",
        description: "Your Creator plan is now active. Start selling!",
      });
      navigate('/dashboard');
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail) {
      toast({
        title: "You're on the list!",
        description: "We'll notify you when the Startup plan launches.",
      });
      setNotifyDialogOpen(false);
      setNotifyEmail('');
    }
  };

  const creatorBenefits = [
    { icon: Check, text: 'Unlimited Products' },
    { icon: Check, text: 'Unlimited Sales' },
    { icon: Check, text: 'T+7 Bank Payouts' },
    { icon: Check, text: 'GST Invoicing' },
    { icon: Check, text: 'Community Access' },
    { icon: Check, text: 'Customer Reviews & Ratings' },
    { icon: Check, text: 'Basic Analytics' },
    { icon: Check, text: 'UPI & Bank Payments' },
  ];

  const startupBenefits = [
    { icon: Sparkles, text: 'Everything in Creator' },
    { icon: BarChart3, text: 'Advanced Analytics' },
    { icon: Users, text: 'Team Access' },
    { icon: Palette, text: 'Storefront Customization' },
    { icon: TrendingUp, text: 'Sales Funnel' },
    { icon: Heart, text: 'Loyalty Program' },
    { icon: Megaphone, text: 'Ad Campaigns' },
    { icon: Check, text: 'Priority Support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-xl text-foreground">GenZaic</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-green to-green-600 flex items-center justify-center mb-4">
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
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <benefit.icon className="w-3 h-3 text-accent-green" />
                  </div>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Startup Plan - Coming Soon */}
          <div className="relative p-6 rounded-2xl border-2 border-border bg-card/50">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent-purple text-white text-xs font-semibold">
              Coming Soon
            </div>
            
            <div className="mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-purple to-purple-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Startup Plan</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-muted-foreground">₹999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                Lower Commission
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {startupBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                    <benefit.icon className="w-3 h-3" />
                  </div>
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setNotifyDialogOpen(true)}
            >
              <Bell className="w-4 h-4" />
              Notify Me When Available
            </Button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="gap-2 bg-gradient-primary hover:opacity-90 px-12"
          >
            {selectedPlan ? 'Start with Creator Plan' : 'Select a Plan to Continue'}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          No credit card required. You keep 75% of every sale.
        </p>
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
              <Button type="submit" className="flex-1 bg-gradient-primary">
                Notify Me
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
