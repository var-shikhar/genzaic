import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { formatINR } from '@/lib/mockData';
import { checkoutAPI } from '@/lib/api/checkout';
import { toast } from 'sonner';

export default function DownloadPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();

  const buyerEmail = searchParams.get('email') || '';
  const buyerName = searchParams.get('name') || '';

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch order details from backend
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await checkoutAPI.getOrderForDownload(orderId);
        setOrder(response.order);
        setHasError(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
        console.error('Failed to load order:', error);
        toast.error(errorMessage);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const handleDownload = async () => {
    if (!order || !orderId) return;

    if (order.downloadCount >= order.maxDownloads) {
      toast.error('Download limit reached. Please contact support.');
      return;
    }

    try {
      // Record download in backend
      await checkoutAPI.recordDownload(orderId);

      // Trigger file download
      toast.success('Download started!');

      if (order.downloadLink) {
        const link = document.createElement('a');
        link.href = order.downloadLink;
        link.download = `${order.productTitle}.zip`;
        link.click();
      }

      // Refresh order to get updated download count
      const response = await checkoutAPI.getOrderForDownload(orderId);
      setOrder(response.order);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      toast.error(errorMessage);
    }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or order not found
  if (hasError || !order) {
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

  // Determine delivery type (default to download if not specified)
  const deliveryType = 'download'; // Simplified for now - can be extended later

  // Extract product info from order
  const productTitle = order.productTitle;
  const productThumbnail = order.productThumbnail;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
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
                    {productThumbnail ? (
                      <img
                        src={productThumbnail}
                        alt={productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{productTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {deliveryType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span>{formatINR(order.amount)}</span>
                  </div>
                  {order.platformFee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>{formatINR(order.platformFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatINR(order.gstAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatINR(order.totalAmount)}</span>
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
                <CardTitle>Download Your Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Downloads Used</span>
                    <span className="font-medium">
                      {order.downloadCount} of {order.maxDownloads}
                    </span>
                  </div>
                  <Progress value={(order.downloadCount / order.maxDownloads) * 100} />
                </div>

                {/* Download Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full h-12"
                    size="lg"
                    onClick={handleDownload}
                    disabled={order.downloadCount >= order.maxDownloads}
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

                {order.downloadCount >= order.maxDownloads && (
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning">
                      You've reached the maximum download limit. Contact support if you need
                      additional downloads.
                    </p>
                  </div>
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
                  <Link to="/">
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
