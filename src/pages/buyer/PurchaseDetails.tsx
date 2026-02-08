import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  Package,
  ExternalLink,
  Calendar,
  CreditCard,
  Mail,
  CheckCircle2,
  Link2,
  Phone,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import BuyerLayout from '@/components/layout/BuyerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { formatINR } from '@/lib/mockData';
import { toast } from "@/lib/toast";

export default function PurchaseDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, buyerOrders } = useAuth();

  const order = buyerOrders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <BuyerLayout>
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Purchase Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find this purchase in your account.
          </p>
          <Button asChild>
            <Link to="/my-purchases">Back to Purchases</Link>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  const handleDownload = () => {
    if (order.downloadCount >= order.maxDownloads) {
      toast.error('Download limit reached. Please contact support.');
      return;
    }
    toast.success(`Downloading ${order.productTitle}...`);
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice downloaded!');
  };

  const handleAccessLink = () => {
    if (order.externalUrl) {
      window.open(order.externalUrl, '_blank');
      toast.success('Opening product link...');
    }
  };

  const handleContactSeller = (method: 'email' | 'phone' | 'whatsapp') => {
    if (method === 'email' && order.sellerEmail) {
      window.location.href = `mailto:${order.sellerEmail}?subject=Order ${order.id} - ${order.productTitle}&body=Hi, I purchased ${order.productTitle} (Order ID: ${order.id}). `;
    } else if (method === 'phone' && order.sellerPhone) {
      window.location.href = `tel:${order.sellerPhone.replace(/\s/g, '')}`;
    } else if (method === 'whatsapp') {
      const phone = order.sellerWhatsapp || order.sellerPhone;
      if (phone) {
        const cleanNumber = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Hi! I purchased ${order.productTitle} (Order ID: ${order.id}). Please help me with the delivery.`);
        window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
      }
    }
  };

  return (
    <BuyerLayout>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/my-purchases')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Purchases
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {order.productThumbnail ? (
                      <img
                        src={order.productThumbnail}
                        alt={order.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Purchased
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {order.deliveryType === 'external_link' ? 'External Link' : order.deliveryType}
                      </Badge>
                      {order.deliveryType === 'manual' && order.deliveryStatus === 'pending' && (
                        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Awaiting Delivery
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-foreground mb-2">
                      {order.productTitle}
                    </h1>
                    {order.productDescription && (
                      <p className="text-muted-foreground text-sm mb-4">
                        {order.productDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Sold by</span>
                      <Link
                        to={`/store/${order.sellerStoreUrl}`}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {order.sellerName}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">
                        {new Date(order.purchasedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-medium font-mono text-sm">{order.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span>{formatINR(order.amount)}</span>
                  </div>
                  {order.platformFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (10%)</span>
                      <span>{formatINR(order.platformFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>{formatINR(order.gstAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span className="text-primary">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {order.deliveryType === 'download' && 'Download Product'}
                  {order.deliveryType === 'external_link' && 'Access Product'}
                  {order.deliveryType === 'manual' && 'Contact Seller'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Digital Download */}
                {order.deliveryType === 'download' && (
                  <>
                    {/* Download Limit */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Downloads Used</span>
                        <span className="font-medium">
                          {order.downloadCount} of {order.maxDownloads}
                        </span>
                      </div>
                      <Progress
                        value={(order.downloadCount / order.maxDownloads) * 100}
                      />
                    </div>

                    {order.downloadCount >= order.maxDownloads && (
                      <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                        <p className="text-sm text-warning">
                          Download limit reached. Contact support for more downloads.
                        </p>
                      </div>
                    )}

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDownload}
                        disabled={order.downloadCount >= order.maxDownloads}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Product
                      </Button>
                    </div>
                  </>
                )}

                {/* External Link */}
                {order.deliveryType === 'external_link' && (
                  <>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Link2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-1">Product Link</p>
                          <p className="text-sm text-muted-foreground break-all">
                            {order.externalUrl}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAccessLink}
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Access Product
                    </Button>
                  </>
                )}

                {/* Manual Delivery */}
                {order.deliveryType === 'manual' && (
                  <>
                    {order.deliveryStatus === 'pending' && (
                      <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Awaiting Delivery</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              The seller will contact you to complete delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.deliveryStatus === 'delivered' && (
                      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Delivered</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your product has been delivered.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Contact Seller</p>
                      {order.sellerEmail && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleContactSeller('email')}
                        >
                          <Mail className="w-4 h-4 mr-3" />
                          <span className="truncate">{order.sellerEmail}</span>
                        </Button>
                      )}
                      {order.sellerPhone && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleContactSeller('phone')}
                        >
                          <Phone className="w-4 h-4 mr-3" />
                          {order.sellerPhone}
                        </Button>
                      )}
                      {(order.sellerWhatsapp || order.sellerPhone) && (
                        <Button
                          className="w-full justify-start bg-[#25D366] hover:bg-[#22c55e] text-white"
                          onClick={() => handleContactSeller('whatsapp')}
                        >
                          <MessageCircle className="w-4 h-4 mr-3" />
                          Message on WhatsApp
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadInvoice}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download GST Invoice
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Need Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Having issues with your {order.deliveryType === 'download' ? 'download' : 'order'} or need assistance?
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@genzaic.com">Contact Support</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </BuyerLayout>
  );
}
