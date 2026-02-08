/**
 * AI Product Extraction Modal
 * Modern modal for extracting product details from WhatsApp/text
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, FileText, Check, Edit2, ChevronDown, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/lib/toast";
import { parseProductText, ExtractedProduct } from '@/lib/api/ai';

interface EditableExtractedProduct extends ExtractedProduct {
  isEditing?: boolean;
}

interface AIExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseProduct: (product: ExtractedProduct) => void;
}

export function AIExtractionModal({ isOpen, onClose, onUseProduct }: AIExtractionModalProps) {

  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<EditableExtractedProduct[]>([]);
  const [visibleProductCount, setVisibleProductCount] = useState(1);

  const handleExtract = async () => {
    if (!rawText.trim()) {
      toast({
        title: 'No Text',
        description: 'Please paste some text to extract product details.',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);
    setExtractedProducts([]);
    setVisibleProductCount(1);

    try {
      const data = await parseProductText(rawText);
      const products = data.products || [];

      if (products.length === 0) {
        toast({
          title: 'No Products Found',
          description: 'Could not find any products in the text. Try a different format.',
          variant: 'destructive',
        });
        return;
      }

      setExtractedProducts(products.map((p) => ({ ...p, isEditing: false })));

      toast({
        title: `Found ${products.length} Product${products.length > 1 ? 's' : ''}`,
        description:
          products.length > 1
            ? 'Review the first product below. Click "See More" to view others.'
            : 'Review the details below and click "Use This" to fill the form.',
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Could not extract product details',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseExtracted = (product: ExtractedProduct) => {
    onUseProduct(product);
    setExtractedProducts((prev) => prev.filter((p) => p !== product));
    
    if (extractedProducts.length === 1) {
      // Last product used, close modal
      handleClose();
    }

    toast({
      title: 'Form Updated',
      description: 'Product details have been filled. You can edit them before saving.',
    });
  };

  const handleEditExtracted = (index: number) => {
    setExtractedProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, isEditing: !p.isEditing } : p))
    );
  };

  const handleUpdateExtracted = (
    index: number,
    field: keyof ExtractedProduct,
    value: string | number
  ) => {
    setExtractedProducts((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        if (field === 'price' || field === 'originalPrice') {
          return { ...p, [field]: value === '' ? undefined : Number(value) };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const handleShowMore = () => {
    setVisibleProductCount((prev) => Math.min(prev + 3, extractedProducts.length));
  };

  const handleClose = () => {
    setRawText('');
    setExtractedProducts([]);
    setVisibleProductCount(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-br from-primary/5 to-accent-purple/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      AI Product Extraction
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Paste your WhatsApp product listing
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <Textarea
                  placeholder="Paste your WhatsApp product text here...&#10;&#10;Example:&#10;Netflix Premium - 1 Year Access&#10;✅ 4K Ultra HD&#10;✅ 4 Screens&#10;✅ All devices supported&#10;Official Price: ₹6000/year&#10;My Price: ₹599 only!"
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="resize-none"
                />

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleExtract}
                    disabled={isExtracting || !rawText.trim()}
                    className="bg-primary hover:opacity-90"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract with AI
                      </>
                    )}
                  </Button>
                  {rawText && (
                    <Button variant="ghost" onClick={() => setRawText('')}>
                      Clear
                    </Button>
                  )}
                </div>

                {/* Extracted Products */}
                {extractedProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Extracted Products ({extractedProducts.length} found)
                      </h3>
                    </div>

                    {extractedProducts.slice(0, visibleProductCount).map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-muted/50 rounded-xl border border-border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            Product {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditExtracted(index)}
                              className="h-8 px-2"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              {product.isEditing ? 'Done' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUseExtracted(product)}
                              className="bg-success hover:bg-success/90 h-8"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Use This
                            </Button>
                          </div>
                        </div>

                        {product.isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={product.title}
                                onChange={(e) =>
                                  handleUpdateExtracted(index, 'title', e.target.value)
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={product.description}
                                onChange={(e) =>
                                  handleUpdateExtracted(index, 'description', e.target.value)
                                }
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={product.price || ''}
                                  onChange={(e) =>
                                    handleUpdateExtracted(index, 'price', e.target.value)
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Original Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={product.originalPrice || ''}
                                  onChange={(e) =>
                                    handleUpdateExtracted(index, 'originalPrice', e.target.value)
                                  }
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Subscription Duration</Label>
                              <Input
                                value={product.subscriptionDuration || ''}
                                onChange={(e) =>
                                  handleUpdateExtracted(
                                    index,
                                    'subscriptionDuration',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., 3 months, 1 year"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Title:</span>
                              <span className="ml-2 font-medium text-foreground">
                                {product.title}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Description:</span>
                              <p className="mt-1 text-foreground whitespace-pre-wrap">
                                {product.description}
                              </p>
                            </div>
                            {product.price && (
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-2 font-medium text-foreground">
                                  ₹{product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="ml-2 text-muted-foreground line-through">
                                    ₹{product.originalPrice}
                                  </span>
                                )}
                              </div>
                            )}
                            {product.subscriptionDuration && (
                              <div>
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="ml-2 font-medium text-foreground">
                                  {product.subscriptionDuration}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {visibleProductCount < extractedProducts.length && (
                      <Button
                        variant="outline"
                        onClick={handleShowMore}
                        className="w-full gap-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                        See More ({extractedProducts.length - visibleProductCount} remaining)
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
