import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Store, Loader2, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    storeUrl: user?.storeUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser(formData);
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your profile has been updated successfully.',
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
