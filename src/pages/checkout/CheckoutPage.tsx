import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  Shield,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  CheckCircle2,
  Lock,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/lib/toast";
import { useAuth } from '@/contexts/AuthContext';
import { checkoutAPI, ProductForCheckout } from '@/lib/api/checkout';

// Helper to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentMethods = [
  { id: 'upi', name: 'UPI', icon: Smartphone, description: 'GPay, PhonePe, Paytm' },
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Credit / Debit Cards' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, description: 'Paytm, Mobikwik' },
  { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All Banks' },
];

export default function CheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<ProductForCheckout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
  });
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load product details from API
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await checkoutAPI.getProductForCheckout(productId);
        setProduct(response.product);
        setHasError(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load product';
        console.error('Failed to load product:', error);
        toast.error(errorMessage);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error or product not found
  if (hasError || !product) {
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

  // Check if current user is the seller of this product
  const isOwnProduct = isAuthenticated && user && product && user.email.toLowerCase() === product.seller.email.toLowerCase();

  // If seller is trying to purchase their own product, show message
  if (isOwnProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">This is Your Product</h2>
            <p className="text-muted-foreground mb-6">
              You cannot purchase your own product. You can access it from your Products page.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button onClick={() => navigate('/dashboard/products')}>
                My Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate amounts
  const gstRate = 0.18;
  const baseAmount = product.price;

  // Calculate platform fee based on seller's setting (10%)
  const platformFee = product.platformFeeMode === 'buyer' ? Math.round(baseAmount * 0.10) : 0;
  const amountForGst = baseAmount + platformFee;
  const gstAmount = Math.round(amountForGst * gstRate);
  const totalAmount = baseAmount + platformFee + gstAmount;

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

    try {
      // Simulate Razorpay payment
      toast.loading('Initiating payment...', { id: 'payment' });
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate payment success and generate payment ID
      const paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;
      toast.success('Payment successful!', { id: 'payment' });

      // Create order in backend
      toast.loading('Creating order...', { id: 'order' });
      const orderResponse = await checkoutAPI.createOrder({
        productId: product.id,
        buyerName: formData.name,
        buyerEmail: formData.email,
        buyerPhone: formData.phone || undefined,
        buyerGstin: formData.gstin || undefined,
        paymentMethod: selectedPayment,
        paymentId,
        sellerId: product.seller.id,
      });

      toast.success('Order created successfully!', { id: 'order' });

      // Navigate to download page
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`/download/${orderResponse.order.id}?product=${productId}&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.name)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      console.error('Payment/Order creation failed:', error);
      toast.error(errorMessage, { id: 'payment' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Genzaic" width={100} height={20} />
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
                    <p className="text-xs text-muted-foreground mt-2">
                      by <span className="font-medium">{product.seller.name}</span>
                    </p>
                  </div>
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
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatINR(totalAmount)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Instant Download</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive instant download access after payment
                      </p>
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
                    <span>Instant Delivery</span>
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
                    Download link will be sent to this email
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
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
