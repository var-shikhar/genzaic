import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  Check,
  AlertCircle,
  Clock,
  CreditCard,
  Building,
  FileText,
  Loader2,
  IndianRupee,
  HelpCircle,
  Info,
  Wallet,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface KYCData {
  documentType: 'pan' | 'aadhaar';
  panNumber: string;
  aadhaarNumber: string;
  documentFile: File | null;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
}

interface PennyDropResult {
  verified: boolean;
  accountHolderName: string;
  bankName: string;
  message: string;
}

export default function KYCPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [pennyDropResult, setPennyDropResult] = useState<PennyDropResult | null>(null);
  const [kycData, setKycData] = useState<KYCData>({
    documentType: 'pan',
    panNumber: '',
    aadhaarNumber: '',
    documentFile: null,
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const getStatusBadge = () => {
    switch (user?.kycStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 text-accent-green">
            <Check className="w-4 h-4" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 text-accent-orange">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Pending Verification</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Not Submitted</span>
          </div>
        );
    }
  };

  const validateIFSC = (ifsc: string) => {
    // IFSC format: 4 letters (bank code) + 0 + 6 alphanumeric characters
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const handlePennyDrop = async () => {
    if (!kycData.accountNumber || !kycData.ifscCode) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your account number and IFSC code first.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateIFSC(kycData.ifscCode)) {
      toast({
        title: 'Invalid IFSC Code',
        description: 'Please enter a valid 11-character IFSC code (e.g., SBIN0001234).',
        variant: 'destructive',
      });
      return;
    }

    setIsPennyDropping(true);
    setPennyDropResult(null);

    // Simulate penny drop verification (in real app, this would call an API)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulate success response with bank details
    const result: PennyDropResult = {
      verified: true,
      accountHolderName: 'RAHUL SHARMA', // This would come from bank
      bankName: 'State Bank of India',
      message: 'We sent ₹1 to your account. Your bank details are verified!',
    };

    setPennyDropResult(result);
    setKycData({
      ...kycData,
      accountHolderName: result.accountHolderName,
      bankName: result.bankName,
    });
    setIsPennyDropping(false);

    toast({
      title: '✅ Bank Account Verified!',
      description: 'We deposited ₹1 to confirm your account. Details matched successfully.',
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setKycData({ ...kycData, documentFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate document
    if (kycData.documentType === 'pan' && !kycData.panNumber) {
      toast({
        title: 'PAN Number Required',
        description: 'Please enter your PAN number.',
        variant: 'destructive',
      });
      return;
    }

    if (kycData.documentType === 'aadhaar' && !kycData.aadhaarNumber) {
      toast({
        title: 'Aadhaar Number Required',
        description: 'Please enter your Aadhaar number.',
        variant: 'destructive',
      });
      return;
    }

    if (!kycData.documentFile) {
      toast({
        title: 'Document Required',
        description: `Please upload your ${kycData.documentType === 'pan' ? 'PAN Card' : 'Aadhaar Card'} image.`,
        variant: 'destructive',
      });
      return;
    }

    if (!pennyDropResult?.verified) {
      toast({
        title: 'Bank Verification Required',
        description: 'Please verify your bank account using the "Verify My Account" button.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateUser({ kycStatus: 'pending' });
    setIsSubmitting(false);
    toast({
      title: '🎉 KYC Submitted Successfully!',
      description: 'We\'ll verify your documents within 1-2 business days.',
    });
  };

  const formatAadhaar = (value: string) => {
    // Format as XXXX XXXX XXXX
    const numbers = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < numbers.length; i += 4) {
      parts.push(numbers.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const resetToUploadFlow = () => {
    setIsSubmitting(false);
    setIsPennyDropping(false);
    setPennyDropResult(null);
    setKycData({
      documentType: 'pan',
      panNumber: '',
      aadhaarNumber: '',
      documentFile: null,
      accountHolderName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      bankName: '',
    });
    updateUser({ kycStatus: 'not_submitted' });
    toast({
      title: 'Upload form opened',
      description: 'You can upload your documents again now.',
    });
  };

  if (user?.kycStatus === 'verified') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-accent-green" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">KYC Verified! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              Your identity has been verified. You can now withdraw your earnings anytime.
            </p>
            <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Document</span>
                <span className="font-medium text-foreground">PAN Card - ABCDE1234F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bank Account</span>
                <span className="font-medium text-foreground">XXXX XXXX 1234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bank Name</span>
                <span className="font-medium text-foreground">State Bank of India</span>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Why KYC Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complete Your KYC</h1>
              <p className="text-muted-foreground mt-1">Required to withdraw your earnings</p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">When do you need KYC?</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="text-accent-green font-medium">✓ You can sell products</span> without KYC. 
                  KYC is only needed when you want to <span className="font-medium text-foreground">withdraw money</span> to your bank account. 
                  Complete it anytime before your first withdrawal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {user?.kycStatus === 'pending' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent-orange/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-accent-orange" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">We're Reviewing Your Documents</h2>
            <p className="text-muted-foreground mb-4">
              This usually takes 1-2 business days. We'll notify you once verified.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>💡 You can continue selling while we verify your documents.</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button type="button" variant="outline" onClick={resetToUploadFlow}>
                Upload / edit documents
              </Button>
              <Button type="button" variant="ghost" onClick={() => toast({ title: 'All set', description: 'We’ll notify you when verification is complete.' })}>
                Okay, I’ll wait
              </Button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Identity Document */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">Upload Identity Proof</h2>
                  <p className="text-sm text-muted-foreground">PAN Card or Aadhaar Card</p>
                </div>
              </div>

              {/* Document Type Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setKycData({ ...kycData, documentType: 'pan' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    kycData.documentType === 'pan'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className={`w-6 h-6 ${kycData.documentType === 'pan' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-foreground">PAN Card</p>
                      <p className="text-xs text-muted-foreground">Permanent Account Number</p>
                    </div>
                  </div>
                  {kycData.documentType === 'pan' && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setKycData({ ...kycData, documentType: 'aadhaar' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    kycData.documentType === 'aadhaar'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-6 h-6 ${kycData.documentType === 'aadhaar' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-foreground">Aadhaar Card</p>
                      <p className="text-xs text-muted-foreground">12-digit identity number</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                {/* Document Number Input */}
                {kycData.documentType === 'pan' ? (
                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      placeholder="ABCDE1234F"
                      value={kycData.panNumber}
                      onChange={(e) => setKycData({ ...kycData, panNumber: e.target.value.toUpperCase().slice(0, 10) })}
                      maxLength={10}
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter 10-character PAN (e.g., ABCDE1234F)</p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="aadhaarNumber"
                      placeholder="1234 5678 9012"
                      value={kycData.aadhaarNumber}
                      onChange={(e) => setKycData({ ...kycData, aadhaarNumber: formatAadhaar(e.target.value) })}
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter 12-digit Aadhaar number</p>
                  </div>
                )}

                {/* Document Upload */}
                <div>
                  <Label>Upload {kycData.documentType === 'pan' ? 'PAN Card' : 'Aadhaar Card'}</Label>
                  <label className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center">
                    {kycData.documentFile ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-6 h-6 text-accent-green" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{kycData.documentFile.name}</p>
                        <p className="text-xs text-accent-green mt-1">File uploaded successfully</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF (max 5MB)</p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleDocumentUpload}
                    />
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Bank Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-foreground">Add Bank Account</h2>
                  <p className="text-sm text-muted-foreground">Where you'll receive your earnings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      placeholder="Enter account number"
                      value={kycData.accountNumber}
                      onChange={(e) => {
                        setKycData({ ...kycData, accountNumber: e.target.value.replace(/\D/g, '') });
                        setPennyDropResult(null); // Reset verification if account changes
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                    <Input
                      id="confirmAccountNumber"
                      placeholder="Re-enter account number"
                      value={kycData.confirmAccountNumber}
                      onChange={(e) => setKycData({ ...kycData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                    />
                    {kycData.confirmAccountNumber && kycData.accountNumber !== kycData.confirmAccountNumber && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Account numbers don't match
                      </p>
                    )}
                    {kycData.confirmAccountNumber && kycData.accountNumber === kycData.confirmAccountNumber && (
                      <p className="text-xs text-accent-green mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Account numbers match
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>IFSC is an 11-character code that identifies your bank branch. You can find it on your cheque book or bank statement.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0001234"
                    value={kycData.ifscCode}
                    onChange={(e) => {
                      setKycData({ ...kycData, ifscCode: e.target.value.toUpperCase().slice(0, 11) });
                      setPennyDropResult(null); // Reset verification if IFSC changes
                    }}
                    maxLength={11}
                    className="uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">11-character code (e.g., SBIN0001234)</p>
                </div>

                {/* Penny Drop Verification Section */}
                <div className={`rounded-xl p-5 ${pennyDropResult?.verified ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-muted/50 border border-border'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      pennyDropResult?.verified ? 'bg-accent-green/20' : 'bg-primary/10'
                    }`}>
                      {pennyDropResult?.verified ? (
                        <CheckCircle2 className="w-6 h-6 text-accent-green" />
                      ) : (
                        <IndianRupee className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {pennyDropResult?.verified ? 'Bank Account Verified! ✅' : 'Verify Your Bank Account'}
                      </h3>
                      {pennyDropResult?.verified ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{pennyDropResult.message}</p>
                          <div className="bg-background/50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Account Holder</span>
                              <span className="font-medium text-foreground">{pennyDropResult.accountHolderName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Bank Name</span>
                              <span className="font-medium text-foreground">{pennyDropResult.bankName}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            We'll deposit <span className="font-semibold text-foreground">₹1</span> to your account to verify it's active and belongs to you. This is instant and secure.
                          </p>
                          <Button
                            type="button"
                            onClick={handlePennyDrop}
                            disabled={isPennyDropping || !kycData.accountNumber || !kycData.ifscCode}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {isPennyDropping ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending ₹1...
                              </>
                            ) : (
                              <>
                                <IndianRupee className="w-4 h-4 mr-2" />
                                Verify My Account
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Frequently Asked Questions</h3>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    What is penny drop verification?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    Penny drop is a secure way to verify your bank account. We deposit ₹1 to your account, which confirms that your account number and IFSC are correct and the account is active. This small amount stays in your account!
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    Why do I need to complete KYC?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    KYC (Know Your Customer) is required by Indian regulations to transfer money. It helps us ensure secure payouts and prevents fraud. You only need to do this once.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    Can I sell products without KYC?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    Yes! You can list and sell products immediately. KYC is only required when you want to withdraw your earnings to your bank account.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    How long does verification take?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3">
                    Bank verification via penny drop is instant. Document verification usually takes 1-2 business days. We'll notify you via email once verified.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
              disabled={isSubmitting || !pennyDropResult?.verified}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>

            {!pennyDropResult?.verified && (
              <p className="text-center text-sm text-muted-foreground">
                Please verify your bank account before submitting
              </p>
            )}
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
