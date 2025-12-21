import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Calendar,
  Building,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPayouts } from '@/lib/mockData';

const stats = [
  {
    title: 'Total Earnings',
    value: '₹24,500',
    icon: TrendingUp,
    color: 'bg-accent-green/10 text-accent-green',
    iconColor: 'text-accent-green',
  },
  {
    title: 'Pending Payout',
    value: '₹8,250',
    icon: Clock,
    color: 'bg-accent-orange/10 text-accent-orange',
    iconColor: 'text-accent-orange',
  },
  {
    title: 'Completed Payouts',
    value: '₹16,250',
    icon: CheckCircle,
    color: 'bg-primary/10 text-primary',
    iconColor: 'text-primary',
  },
];

export default function PayoutsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and payout status</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Payout Cycle Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Payout Cycle: T+1</h3>
              <p className="text-sm text-muted-foreground">
                Your earnings are processed within 1 business day after successful payment. Payouts are
                automatically transferred to your verified bank account.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bank Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Payout Account</h2>
            <span className="px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-medium">
              Verified
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Building className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">State Bank of India</p>
              <p className="text-sm text-muted-foreground">XXXX XXXX 1234 • SBIN0001234</p>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                    Payout ID
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {payout.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">₹{payout.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          payout.status === 'completed'
                            ? 'bg-accent-green/10 text-accent-green'
                            : payout.status === 'pending'
                            ? 'bg-accent-orange/10 text-accent-orange'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {payout.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {payout.status === 'pending' && <Clock className="w-3 h-3" />}
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payout.createdAt).toLocaleDateString('en-IN', {
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
