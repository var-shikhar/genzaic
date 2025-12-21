import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Search,
  Eye,
  X,
  Building,
  User,
  Package,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockInvoices, Invoice } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = mockInvoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateGST = (amount: number) => {
    const baseAmount = amount / 1.18;
    const gst = amount - baseAmount;
    return { baseAmount: baseAmount.toFixed(2), gst: gst.toFixed(2) };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">GST Invoices</h1>
          <p className="text-muted-foreground mt-1">View and download your GST-compliant invoices</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Invoices Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
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
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </motion.div>

        {/* Invoice Preview Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Invoice Details</h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="p-6 space-y-6">
                {/* Invoice Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold">G</span>
                      </div>
                      <span className="font-bold text-xl text-foreground">GenZaic</span>
                    </div>
                    <p className="text-sm text-muted-foreground">GST Tax Invoice</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-foreground">
                      {selectedInvoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Seller & Buyer */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">Seller</span>
                    </div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground mt-2">GSTIN: 29ABCDE1234F1Z5</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">Buyer</span>
                    </div>
                    <p className="font-medium text-foreground">{selectedInvoice.buyerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.buyerEmail}</p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">Product Details</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-foreground">{selectedInvoice.productTitle}</span>
                      <span className="font-medium text-foreground">₹{selectedInvoice.amount}</span>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Base Amount</span>
                        <span className="text-foreground">
                          ₹{calculateGST(selectedInvoice.amount).baseAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">CGST (9%)</span>
                        <span className="text-foreground">
                          ₹{(parseFloat(calculateGST(selectedInvoice.amount).gst) / 2).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SGST (9%)</span>
                        <span className="text-foreground">
                          ₹{(parseFloat(calculateGST(selectedInvoice.amount).gst) / 2).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-semibold pt-2 border-t border-border">
                        <span className="text-foreground flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          Total
                        </span>
                        <span className="text-foreground">₹{selectedInvoice.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button className="gap-2 bg-gradient-primary hover:opacity-90">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
