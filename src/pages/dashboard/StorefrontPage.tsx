import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const themes = [
  { id: 'minimal', name: 'Minimal', color: 'from-slate-400 to-slate-600' },
  { id: 'modern', name: 'Modern', color: 'from-primary to-secondary' },
  { id: 'creative', name: 'Creative', color: 'from-purple-500 to-pink-500' },
  { id: 'professional', name: 'Professional', color: 'from-blue-600 to-cyan-500' },
];

export default function StorefrontPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const storeUrl = `${user?.storeUrl || 'creator'}.genzaic.com`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${storeUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'URL Copied',
      description: 'Store URL copied to clipboard.',
    });
  };

  const handlePublish = () => {
    toast({
      title: 'Store Published!',
      description: 'Your storefront is now live.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storefront</h1>
            <p className="text-muted-foreground mt-1">Customize and preview your store</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{storeUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="p-1 rounded hover:bg-background transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-accent-green" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90" onClick={handlePublish}>
              Publish Store
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Theme Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="font-semibold text-foreground mb-4">Select Theme</h2>
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.color}`} />
                  <span className="font-medium text-foreground">{theme.name}</span>
                  {selectedTheme === theme.id && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
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
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 bg-muted/30 min-h-[600px] flex items-center justify-center">
              <div
                className={`bg-background rounded-xl shadow-lg overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                }`}
              >
                {/* Store Header */}
                <div className={`p-6 bg-gradient-to-br ${themes.find((t) => t.id === selectedTheme)?.color}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user?.name?.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">{user?.name || 'Creator Store'}</h1>
                      <p className="text-white/80 text-sm">Digital products by {user?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  <h2 className="font-semibold text-foreground mb-4">Products</h2>
                  <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                    {mockProducts.slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Package className="w-8 h-8 text-primary/40" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-foreground text-sm line-clamp-1">
                            {product.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-foreground">₹{product.price}</span>
                            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
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
                    Powered by <span className="font-semibold text-primary">GenZaic</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
