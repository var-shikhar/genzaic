import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  FileText,
  Package,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Phone,
  MessageCircle,
  Clock,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getProductById, formatINR, mockCurrentUser } from '@/lib/mockData';
import { toast } from 'sonner';

export default function DownloadPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get('product') || '';
  const buyerEmail = searchParams.get('email') || '';
  const buyerName = searchParams.get('name') || '';

  const product = getProductById(productId);
  const [downloadCount, setDownloadCount] = useState(0);
  const maxDownloads = 5;
  const [copied, setCopied] = useState(false);

  const gstRate = 0.18;
  const baseAmount = product?.price || 0;
  const gstAmount = Math.round(baseAmount * gstRate);
  const totalAmount = baseAmount + gstAmount;

  const handleDownload = () => {
    if (downloadCount >= maxDownloads) {
      toast.error('Download limit reached. Please contact support.');
      return;
    }

    // Simulate download
    toast.success('Download started!');
    setDownloadCount((prev) => prev + 1);

    // In production, this would trigger actual file download
    const link = document.createElement('a');
    link.href = product?.fileUrl || '#';
    link.download = `${product?.title || 'product'}.zip`;
    // link.click();
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded!');
    // In production, this would generate and download PDF invoice
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId || '');
    setCopied(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternalLink = () => {
    if (product?.externalUrl) {
      window.open(product.externalUrl, '_blank');
      toast.success('Opening product link...');
    }
  };

  const handleContactSeller = (method: 'email' | 'phone' | 'whatsapp') => {
    const sellerEmail = product?.sellerContactEmail || mockCurrentUser.contactEmail;
    const sellerPhone = product?.sellerContactPhone || mockCurrentUser.contactPhone;
    const sellerWhatsapp = product?.sellerContactWhatsapp || sellerPhone;

    if (method === 'email' && sellerEmail) {
      window.location.href = `mailto:${sellerEmail}?subject=Order ${orderId} - ${product?.title}&body=Hi, I just purchased ${product?.title} (Order ID: ${orderId}). `;
    } else if (method === 'phone' && sellerPhone) {
      window.location.href = `tel:${sellerPhone.replace(/\s/g, '')}`;
    } else if (method === 'whatsapp' && sellerWhatsapp) {
      const cleanNumber = sellerWhatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(`Hi! I just purchased ${product?.title} (Order ID: ${orderId}). Please help me with the delivery.`);
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find this order. Please check your email for the download link.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg text-foreground">GenZaic</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Success Message */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase, {buyerName}!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Details
                  <Badge variant="outline" className="font-mono border-2">
                    {orderId}
                    <button 
                      onClick={copyOrderId} 
                      className="ml-2 p-0.5 rounded hover:bg-muted transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-success" />
                      ) : (
                        <Copy className="w-3 h-3 text-foreground" />
                      )}
                    </button>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {product.category && (
                        <Badge variant="secondary" className="capitalize">
                          {product.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="capitalize">
                        {product.deliveryType === 'external_link' ? 'External Link' : product.deliveryType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span>{formatINR(baseAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatINR(gstAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                <Separator />

                {/* Buyer Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{buyerEmail}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Card - Based on Delivery Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {product.deliveryType === 'download' && 'Download Your Product'}
                  {product.deliveryType === 'external_link' && 'Access Your Product'}
                  {product.deliveryType === 'manual' && 'Order Confirmed'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Digital Download */}
                {product.deliveryType === 'download' && (
                  <>
                    {/* Download Limit */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Downloads Used</span>
                        <span className="font-medium">
                          {downloadCount} of {maxDownloads}
                        </span>
                      </div>
                      <Progress value={(downloadCount / maxDownloads) * 100} />
                    </div>

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      <Button
                        className="w-full h-12"
                        size="lg"
                        onClick={handleDownload}
                        disabled={downloadCount >= maxDownloads}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Product
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleDownloadInvoice}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download GST Invoice
                      </Button>
                    </div>

                    {downloadCount >= maxDownloads && (
                      <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                        <p className="text-sm text-warning">
                          You've reached the maximum download limit. Contact support if you need
                          additional downloads.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* External Link */}
                {product.deliveryType === 'external_link' && (
                  <>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Link2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-1">Product Link</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {product.externalUrl}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full h-12"
                        size="lg"
                        onClick={handleOpenExternalLink}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Access Product
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleDownloadInvoice}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Download GST Invoice
                      </Button>
                    </div>
                  </>
                )}

                {/* Manual Delivery */}
                {product.deliveryType === 'manual' && (
                  <>
                    <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Awaiting Seller Contact</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            The seller has been notified and will contact you within 24 hours to complete your delivery.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Contact Seller</p>
                      <div className="grid gap-2">
                        {(product.sellerContactEmail || mockCurrentUser.contactEmail) && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleContactSeller('email')}
                          >
                            <Mail className="w-4 h-4 mr-3" />
                            <span className="truncate">
                              {product.sellerContactEmail || mockCurrentUser.contactEmail}
                            </span>
                          </Button>
                        )}
                        {(product.sellerContactPhone || mockCurrentUser.contactPhone) && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleContactSeller('phone')}
                          >
                            <Phone className="w-4 h-4 mr-3" />
                            {product.sellerContactPhone || mockCurrentUser.contactPhone}
                          </Button>
                        )}
                        {(product.sellerContactWhatsapp || product.sellerContactPhone || mockCurrentUser.contactPhone) && (
                          <Button
                            className="w-full justify-start bg-[#25D366] hover:bg-[#22c55e] text-white"
                            onClick={() => handleContactSeller('whatsapp')}
                          >
                            <MessageCircle className="w-4 h-4 mr-3" />
                            Message on WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownloadInvoice}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download GST Invoice
                    </Button>
                  </>
                )}

                {/* Email Confirmation */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📧 A confirmation email has been sent to{' '}
                    <span className="font-medium text-foreground">{buyerEmail}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-muted/30">
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
              <p className="text-muted-foreground mb-4">
                Access your purchases anytime from your dashboard
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/my-purchases">
                    View My Purchases
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/store/${mockCurrentUser.storeUrl}`}>
                    Explore More Products
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@genzaic.com" className="text-primary hover:underline">
              support@genzaic.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
