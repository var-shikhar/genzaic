import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  FileText,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Search,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockSellers, mockInvoices, mockPayouts } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

type Tab = 'sellers' | 'transactions' | 'invoices' | 'payouts';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('sellers');
  const [searchQuery, setSearchQuery] = useState('');
  const [sellers, setSellers] = useState(mockSellers);
  const [payouts, setPayouts] = useState(mockPayouts);
  const { toast } = useToast();

  const tabs = [
    { id: 'sellers' as Tab, label: 'Sellers', icon: Users, count: sellers.length },
    { id: 'transactions' as Tab, label: 'Transactions', icon: FileText, count: mockInvoices.length },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText, count: mockInvoices.length },
    { id: 'payouts' as Tab, label: 'Payouts', icon: Wallet, count: payouts.length },
  ];

  const handleKycStatusChange = (sellerId: string, status: 'pending' | 'verified' | 'rejected') => {
    setSellers(
      sellers.map((s) => (s.id === sellerId ? { ...s, kycStatus: status } : s))
    );
    toast({
      title: 'KYC Status Updated',
      description: `Seller KYC status changed to ${status}.`,
    });
  };

  const handlePayoutStatusChange = (payoutId: string, status: 'pending' | 'completed') => {
    setPayouts(
      payouts.map((p) => (p.id === payoutId ? { ...p, status } : p))
    );
    toast({
      title: 'Payout Status Updated',
      description: `Payout marked as ${status}.`,
    });
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent-orange/10 text-accent-orange text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">GenZaic Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-background'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {activeTab === 'sellers' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Seller
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      KYC Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Products
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Joined
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {seller.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{seller.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{seller.email}</span>
                      </td>
                      <td className="px-6 py-4">{getKycBadge(seller.kycStatus)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">-</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleKycStatusChange(seller.id, 'verified')}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 text-accent-green" />
                                Mark Verified
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleKycStatusChange(seller.id, 'pending')}
                              >
                                <Clock className="w-4 h-4 mr-2 text-accent-orange" />
                                Mark Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleKycStatusChange(seller.id, 'rejected')}
                                className="text-destructive"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Reject KYC
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Payout ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Seller
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {payout.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">Seller</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">₹{payout.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payout.status === 'completed'
                              ? 'bg-accent-green/10 text-accent-green'
                              : 'bg-accent-orange/10 text-accent-orange'
                          }`}
                        >
                          {payout.status === 'completed' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          {payout.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayoutStatusChange(payout.id, 'completed')}
                            >
                              Mark Processed
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'transactions' || activeTab === 'invoices') && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Invoice No.
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Buyer
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{invoice.productTitle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{invoice.buyerEmail}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">₹{invoice.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
