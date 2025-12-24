import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Package,
  Shield,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  CheckCircle2,
  Lock,
  Download,
  Link2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getProductById, formatINR, generateOrderId, BuyerOrder, PLATFORM_FEE_RATE, mockCurrentUser } from '@/lib/mockData';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Credit / Debit Cards' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, description: 'Paytm, Mobikwik' },
  { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All Banks' },
];

const deliveryTypeInfo = {
  download: {
    icon: Download,
    title: 'Instant Download',
    description: "You'll receive instant download access after payment",
  },
  external_link: {
    icon: Link2,
    title: 'Access Link',
    description: "You'll be redirected to access your product after payment",
  },
  manual: {
    icon: Mail,
    title: 'Manual Delivery',
    description: 'The seller will contact you within 24 hours to deliver your product',
  },
};

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, addBuyerOrder } = useAuth();
  const product = getProductById(productId || '');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
  });
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get seller's platform fee mode (default: seller pays)
  const platformFeeMode = mockCurrentUser.storefrontSettings?.platformFeeMode || 'seller';

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gstRate = 0.18;
  const baseAmount = product.price;
  
  // Calculate platform fee based on seller's setting
  const platformFee = platformFeeMode === 'buyer' ? Math.round(baseAmount * PLATFORM_FEE_RATE) : 0;
  const amountForGst = baseAmount + platformFee;
  const gstAmount = Math.round(amountForGst * gstRate);
  const totalAmount = baseAmount + platformFee + gstAmount;

  const deliveryInfo = deliveryTypeInfo[product.deliveryType];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsProcessing(true);

    // Simulate Razorpay payment
    toast.loading('Initiating payment...', { id: 'payment' });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment success
    toast.success('Payment successful!', { id: 'payment' });

    // Generate order ID and navigate to download page
    const orderId = generateOrderId();
    
    // Save to buyer orders if logged in
    if (isAuthenticated && product) {
      const buyerOrder: BuyerOrder = {
        id: orderId,
        productId: product.id,
        productTitle: product.title,
        productThumbnail: product.thumbnailUrl,
        productDescription: product.description,
        sellerName: mockCurrentUser.name,
        sellerStoreUrl: mockCurrentUser.storeUrl,
        sellerEmail: product.sellerContactEmail || mockCurrentUser.contactEmail,
        sellerPhone: product.sellerContactPhone || mockCurrentUser.contactPhone,
        sellerWhatsapp: product.sellerContactWhatsapp,
        amount: baseAmount,
        gstAmount,
        platformFee: platformFeeMode === 'buyer' ? platformFee : undefined,
        totalAmount,
        purchasedAt: new Date().toISOString(),
        downloadCount: 0,
        maxDownloads: product.deliveryType === 'download' ? 5 : 0,
        downloadLink: product.deliveryType === 'download' ? `https://download.genzaic.com/${orderId}` : '',
        deliveryType: product.deliveryType,
        externalUrl: product.externalUrl,
        deliveryStatus: product.deliveryType === 'manual' ? 'pending' : undefined,
      };
      addBuyerOrder(buyerOrder);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    navigate(`/download/${orderId}?product=${productId}&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-lg text-foreground">GenZaic</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Product Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Card */}
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    {product.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-warning fill-warning" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({product.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {product.category && (
                    <Badge variant="secondary" className="capitalize">
                      {product.category}
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    <deliveryInfo.icon className="w-3 h-3 mr-1" />
                    {product.deliveryType === 'external_link' ? 'External Link' : product.deliveryType}
                  </Badge>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="text-foreground">{formatINR(baseAmount)}</span>
                  </div>
                  {platformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (10%)</span>
                      <span className="text-foreground">{formatINR(platformFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="text-foreground">{formatINR(gstAmount)}</span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-success">
                        -{formatINR(product.originalPrice - product.price)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <deliveryInfo.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{deliveryInfo.title}</p>
                      <p className="text-sm text-muted-foreground">{deliveryInfo.description}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-success" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>{product.deliveryType === 'manual' ? 'Verified Seller' : 'Instant Delivery'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Buyer Details & Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Buyer Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {product.deliveryType === 'download' 
                      ? 'Download link will be sent to this email'
                      : product.deliveryType === 'manual'
                      ? 'The seller will contact you at this email'
                      : 'Access link will be sent to this email'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">
                    GSTIN <span className="text-muted-foreground">(Optional - for business)</span>
                  </Label>
                  <Input
                    id="gstin"
                    placeholder="e.g., 29ABCDE1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className={errors.gstin ? 'border-destructive' : ''}
                  />
                  {errors.gstin && (
                    <p className="text-sm text-destructive">{errors.gstin}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPayment === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <method.icon className={`w-6 h-6 mb-2 ${
                        selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay {formatINR(totalAmount)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Powered by <span className="font-semibold">Razorpay</span> • 100% Secure Payments
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
