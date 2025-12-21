import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Mail,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockOrders } from '@/lib/mockData';

const mockDownloads = mockOrders.map((order, i) => ({
  id: `dl-${i}`,
  orderId: order.id,
  productId: order.productId,
  productTitle: order.productTitle,
  buyerEmail: order.buyerEmail,
  downloadCount: Math.floor(Math.random() * 5),
  maxDownloads: 5,
  status: Math.random() > 0.3 ? 'active' : 'expired',
  lastDownload: order.createdAt,
  createdAt: order.createdAt,
}));

export default function DeliveryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Delivery</h1>
          <p className="text-muted-foreground mt-1">Track product downloads and delivery status</p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Download Limits</h3>
              <p className="text-sm text-muted-foreground">
                Each purchase allows up to 5 downloads. Download links expire after 7 days. Buyers
                receive an email with the download link immediately after purchase.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Downloads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Download Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Buyer
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Downloads
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Last Download
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockDownloads.map((download) => (
                  <tr key={download.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{download.productTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{download.buyerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {download.downloadCount} / 5
                        </span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(download.downloadCount / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          download.status === 'active'
                            ? 'bg-accent-green/10 text-accent-green'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {download.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {download.lastDownload
                          ? new Date(download.lastDownload).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
