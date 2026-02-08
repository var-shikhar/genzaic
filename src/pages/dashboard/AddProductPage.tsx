import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Package, Loader2, Download, Link2, Mail, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from "@/lib/toast";
import { DeliveryType } from '@/lib/mockData';

const deliveryTypeOptions = [
  {
    id: 'download' as DeliveryType,
    icon: Download,
    title: 'Digital Download',
    description: 'Upload a file that buyers can download instantly after purchase',
  },
  {
    id: 'external_link' as DeliveryType,
    icon: Link2,
    title: 'External Link',
    description: 'Redirect buyers to a URL (Notion, Google Drive, Gumroad, etc.)',
  },
  {
    id: 'manual' as DeliveryType,
    icon: Mail,
    title: 'Manual Delivery',
    description: 'For subscriptions, services, or custom delivery. You contact the buyer after purchase.',
  },
];

export default function AddProductPage() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    file: null as File | null,
    thumbnail: null as File | null,
    seoTitle: '',
    seoKeywords: '',
    deliveryType: 'download' as DeliveryType,
    externalUrl: '',
    sellerContactEmail: '',
    sellerContactPhone: '',
    sellerContactWhatsapp: '',
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

    // Validate based on delivery type
    if (productData.deliveryType === 'download' && !productData.file) {
      toast({
        title: 'Missing File',
        description: 'Please upload a product file for digital downloads.',
        variant: 'destructive',
      });
      return;
    }

    if (productData.deliveryType === 'external_link' && !productData.externalUrl) {
      toast({
        title: 'Missing URL',
        description: 'Please provide an external URL for the product.',
        variant: 'destructive',
      });
      return;
    }

    if (productData.deliveryType === 'manual' && !productData.sellerContactEmail) {
      toast({
        title: 'Missing Contact',
        description: 'Please provide at least an email for buyers to contact you.',
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
          {/* Delivery Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Delivery Method</h2>
                <p className="text-sm text-muted-foreground">How will buyers receive this product?</p>
              </div>
            </div>

            <RadioGroup
              value={productData.deliveryType}
              onValueChange={(value) => setProductData({ ...productData, deliveryType: value as DeliveryType })}
              className="grid gap-3"
            >
              {deliveryTypeOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    productData.deliveryType === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setProductData({ ...productData, deliveryType: option.id })}
                >
                  <RadioGroupItem value={option.id} id={`delivery-${option.id}`} className="mt-1" />
                  <div className="flex-1">
                    <Label 
                      htmlFor={`delivery-${option.id}`} 
                      className="text-base font-medium cursor-pointer flex items-center gap-2"
                    >
                      <option.icon className="w-4 h-4" />
                      {option.title}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                  Platform fee: 10% per sale (configurable in Settings)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Conditional Fields Based on Delivery Type */}
          {productData.deliveryType === 'download' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
          )}

          {productData.deliveryType === 'external_link' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">External Link</h2>
                  <p className="text-sm text-muted-foreground">Where should buyers be redirected after purchase?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="externalUrl">Product URL *</Label>
                  <Input
                    id="externalUrl"
                    type="url"
                    placeholder="https://notion.so/your-template or https://drive.google.com/..."
                    value={productData.externalUrl}
                    onChange={(e) => setProductData({ ...productData, externalUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyers will see this link and be able to access it after purchase
                  </p>
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
          )}

          {productData.deliveryType === 'manual' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Contact Information</h2>
                  <p className="text-sm text-muted-foreground">How should buyers reach you after purchase?</p>
                </div>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Manual Delivery</p>
                    <p className="text-muted-foreground mt-1">
                      After a buyer completes payment, they'll see your contact info and you'll receive an email notification with their details. 
                      This is ideal for subscriptions, consulting, or custom deliveries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="sellerContactEmail">Contact Email *</Label>
                  <Input
                    id="sellerContactEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={productData.sellerContactEmail}
                    onChange={(e) => setProductData({ ...productData, sellerContactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerContactPhone">Contact Phone (Optional)</Label>
                  <Input
                    id="sellerContactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={productData.sellerContactPhone}
                    onChange={(e) => setProductData({ ...productData, sellerContactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerContactWhatsapp">WhatsApp Number (Optional)</Label>
                  <Input
                    id="sellerContactWhatsapp"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={productData.sellerContactWhatsapp}
                    onChange={(e) => setProductData({ ...productData, sellerContactWhatsapp: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyers can click to message you on WhatsApp directly
                  </p>
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
          )}

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
              className="bg-primary hover:opacity-90"
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
