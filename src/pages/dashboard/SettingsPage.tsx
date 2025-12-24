import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Store, Loader2, Save, Percent, Users, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatINR, PLATFORM_FEE_RATE } from '@/lib/mockData';

export default function SettingsPage() {
  const { user, updateUser, updateStorefrontSettings } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    storeUrl: user?.storeUrl || '',
  });
  const [platformFeeMode, setPlatformFeeMode] = useState<'seller' | 'buyer'>(
    user?.storefrontSettings?.platformFeeMode || 'seller'
  );

  // Example calculation for display
  const examplePrice = 1000;
  const platformFee = Math.round(examplePrice * PLATFORM_FEE_RATE);
  const gst = Math.round(examplePrice * 0.18);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser(formData);
    updateStorefrontSettings({ platformFeeMode });
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your profile and store settings have been updated successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ''}
                    readOnly
                    className="pl-10 bg-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed after signup
                </p>
              </div>
            </div>
          </motion.div>

          {/* Store Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Store Settings</h2>
                <p className="text-sm text-muted-foreground">Customize your storefront</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="storeUrl">Store URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="storeUrl"
                    value={formData.storeUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storeUrl: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.genzaic.com</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Fee Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Platform Fee Settings</h2>
                <p className="text-sm text-muted-foreground">Choose who pays the 10% platform fee</p>
              </div>
            </div>

            <RadioGroup 
              value={platformFeeMode} 
              onValueChange={(value) => setPlatformFeeMode(value as 'seller' | 'buyer')}
              className="space-y-4"
            >
              {/* Seller absorbs fee */}
              <div 
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  platformFeeMode === 'seller' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
                onClick={() => setPlatformFeeMode('seller')}
              >
                <RadioGroupItem value="seller" id="fee-seller" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="fee-seller" className="text-base font-medium cursor-pointer flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    I'll absorb the platform fee
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    The 10% platform fee will be deducted from your earnings. Buyers pay only the product price + GST.
                  </p>
                  {platformFeeMode === 'seller' && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                      <p className="text-muted-foreground">Example for {formatINR(examplePrice)} product:</p>
                      <div className="flex justify-between">
                        <span>Buyer pays:</span>
                        <span className="font-medium">{formatINR(examplePrice + gst)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Platform fee (deducted):</span>
                        <span>-{formatINR(platformFee)}</span>
                      </div>
                      <div className="flex justify-between text-success font-medium pt-1 border-t border-border">
                        <span>You receive:</span>
                        <span>{formatINR(examplePrice - platformFee)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buyer pays fee */}
              <div 
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  platformFeeMode === 'buyer' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
                onClick={() => setPlatformFeeMode('buyer')}
              >
                <RadioGroupItem value="buyer" id="fee-buyer" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="fee-buyer" className="text-base font-medium cursor-pointer flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Buyer pays the platform fee
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    The 10% platform fee will be added to the buyer's total. You receive 100% of your product price.
                  </p>
                  {platformFeeMode === 'buyer' && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                      <p className="text-muted-foreground">Example for {formatINR(examplePrice)} product:</p>
                      <div className="flex justify-between">
                        <span>Product price:</span>
                        <span>{formatINR(examplePrice)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Platform fee (10%):</span>
                        <span>+{formatINR(platformFee)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>GST (18%):</span>
                        <span>+{formatINR(gst)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-1 border-t border-border">
                        <span>Buyer pays:</span>
                        <span>{formatINR(examplePrice + platformFee + gst)}</span>
                      </div>
                      <div className="flex justify-between text-success font-medium">
                        <span>You receive:</span>
                        <span>{formatINR(examplePrice)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </RadioGroup>
          </motion.div>

          {/* Save Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 h-12"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
