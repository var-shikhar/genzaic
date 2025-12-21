import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Package, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    file: null as File | null,
    thumbnail: null as File | null,
    seoTitle: '',
    seoKeywords: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productData.title || !productData.price) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in the required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    toast({
      title: 'Product Created',
      description: 'Your product has been added to your store.',
    });
    navigate('/dashboard/products');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
            <p className="text-muted-foreground mt-1">Create a new digital product for your store</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Product Details</h2>
                <p className="text-sm text-muted-foreground">Basic information about your product</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Ultimate UI Kit for Figma"
                  value={productData.title}
                  onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's included in your product..."
                  rows={4}
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Platform fee: 5% per sale
                </p>
              </div>
            </div>
          </motion.div>

          {/* Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Files</h2>
                <p className="text-sm text-muted-foreground">Upload your product files</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Product File (PDF/ZIP) *</Label>
                <label className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {productData.file ? productData.file.name : 'Click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, ZIP up to 100MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.zip"
                    onChange={(e) => setProductData({ ...productData, file: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
              <div>
                <Label>Cover Image</Label>
                <label className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {productData.thumbnail ? productData.thumbnail.name : 'Click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => setProductData({ ...productData, thumbnail: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* SEO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="font-semibold text-foreground mb-4">SEO Settings (Optional)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
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
          </motion.div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
