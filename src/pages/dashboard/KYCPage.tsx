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
  User,
  FileText,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface KYCData {
  panNumber: string;
  panFile: File | null;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
}

export default function KYCPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [pennyDropVerified, setPennyDropVerified] = useState(false);
  const [kycData, setKycData] = useState<KYCData>({
    panNumber: '',
    panFile: null,
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
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

  const handlePennyDrop = async () => {
    if (!kycData.accountNumber || !kycData.ifscCode) {
      toast({
        title: 'Missing Information',
        description: 'Please enter account number and IFSC code first.',
        variant: 'destructive',
      });
      return;
    }

    setIsPennyDropping(true);
    // Simulate penny drop verification
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsPennyDropping(false);
    setPennyDropVerified(true);
    toast({
      title: 'Account Verified',
      description: 'Bank account verified successfully via penny drop.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (kycData.accountNumber !== kycData.confirmAccountNumber) {
      toast({
        title: 'Account Mismatch',
        description: 'Account numbers do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!pennyDropVerified) {
      toast({
        title: 'Verification Required',
        description: 'Please verify your bank account via penny drop.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateUser({ kycStatus: 'pending' });
    setIsSubmitting(false);
    toast({
      title: 'KYC Submitted',
      description: 'Your documents have been submitted for verification.',
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
            <h1 className="text-2xl font-bold text-foreground mb-2">KYC Verified</h1>
            <p className="text-muted-foreground mb-6">
              Your identity has been verified. You can now receive payouts.
            </p>
            <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PAN Number</span>
                <span className="font-medium text-foreground">ABCDE1234F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bank Account</span>
                <span className="font-medium text-foreground">XXXX XXXX 1234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IFSC Code</span>
                <span className="font-medium text-foreground">SBIN0001234</span>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
            <p className="text-muted-foreground mt-1">Complete your identity verification to receive payouts</p>
          </div>
          {getStatusBadge()}
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
            <h2 className="text-xl font-bold text-foreground mb-2">Verification in Progress</h2>
            <p className="text-muted-foreground">
              Your documents are being reviewed. This usually takes 1-2 business days.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PAN Card Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">PAN Card Details</h2>
                  <p className="text-sm text-muted-foreground">For tax compliance and GST invoicing</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    placeholder="ABCDE1234F"
                    value={kycData.panNumber}
                    onChange={(e) => setKycData({ ...kycData, panNumber: e.target.value.toUpperCase() })}
                    maxLength={10}
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label>Upload PAN Card</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {kycData.panFile ? kycData.panFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => setKycData({ ...kycData, panFile: e.target.files?.[0] || null })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bank Account Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Bank Account Details</h2>
                  <p className="text-sm text-muted-foreground">For receiving your payouts</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    placeholder="As per bank records"
                    value={kycData.accountHolderName}
                    onChange={(e) => setKycData({ ...kycData, accountHolderName: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      placeholder="Enter account number"
                      value={kycData.accountNumber}
                      onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                    <Input
                      id="confirmAccountNumber"
                      placeholder="Re-enter account number"
                      value={kycData.confirmAccountNumber}
                      onChange={(e) => setKycData({ ...kycData, confirmAccountNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0001234"
                    value={kycData.ifscCode}
                    onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value.toUpperCase() })}
                    maxLength={11}
                    className="uppercase"
                  />
                </div>

                {/* Penny Drop Verification */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        pennyDropVerified ? 'bg-accent-green/10' : 'bg-primary/10'
                      }`}>
                        {pennyDropVerified ? (
                          <Check className="w-5 h-5 text-accent-green" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Penny Drop Verification</p>
                        <p className="text-xs text-muted-foreground">
                          {pennyDropVerified ? 'Account verified successfully' : 'Verify your bank account instantly'}
                        </p>
                      </div>
                    </div>
                    {!pennyDropVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePennyDrop}
                        disabled={isPennyDropping}
                      >
                        {isPennyDropping ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify Now'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 h-12"
              disabled={isSubmitting || !pennyDropVerified}
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
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
