import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Wallet,
  Shield,
  ArrowUpRight,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockOrders, mockProducts } from '@/lib/mockData';

const stats = [
  {
    title: 'Total Sales',
    value: '₹24,500',
    change: '+12.5%',
    icon: TrendingUp,
    color: 'from-accent-green to-green-600',
    bgColor: 'bg-accent-green/10',
  },
  {
    title: 'Total Orders',
    value: '156',
    change: '+8.2%',
    icon: ShoppingCart,
    color: 'from-accent-purple to-purple-600',
    bgColor: 'bg-accent-purple/10',
  },
  {
    title: 'Products',
    value: mockProducts.length.toString(),
    change: '',
    icon: Package,
    color: 'from-accent-orange to-orange-600',
    bgColor: 'bg-accent-orange/10',
  },
  {
    title: 'Pending Payout',
    value: '₹8,250',
    change: 'T+1',
    icon: Wallet,
    color: 'from-primary to-secondary',
    bgColor: 'bg-primary/10',
  },
];

const recentOrders = mockOrders.slice(0, 5);

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'Creator'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
          </div>
          <Link to="/dashboard/products/new">
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* KYC Alert */}
        {user?.kycStatus !== 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent-orange/10 border border-accent-orange/30 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-orange" />
              </div>
              <div>
                <p className="font-medium text-foreground">Complete your KYC</p>
                <p className="text-sm text-muted-foreground">Verify your identity to start receiving payouts</p>
              </div>
            </div>
            <Link to="/dashboard/kyc">
              <Button variant="outline" size="sm" className="gap-1">
                Complete KYC
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('green') ? '#10b981' : stat.color.includes('purple') ? '#8b5cf6' : stat.color.includes('orange') ? '#f97316' : '#073f7c' }} />
                </div>
                {stat.change && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-accent-green/10 text-accent-green' : 'bg-primary/10 text-primary'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/dashboard/products/new"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-green/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Add Product</p>
                  <p className="text-xs text-muted-foreground">Upload a new item</p>
                </div>
              </Link>
              <Link
                to="/dashboard/storefront"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Store</p>
                  <p className="text-xs text-muted-foreground">Preview your shop</p>
                </div>
              </Link>
              <Link
                to="/dashboard/invoices"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Invoices</p>
                  <p className="text-xs text-muted-foreground">View GST invoices</p>
                </div>
              </Link>
              <Link
                to="/dashboard/payouts"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Payouts</p>
                  <p className="text-xs text-muted-foreground">Track earnings</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <Link to="/dashboard/invoices" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{order.productTitle}</p>
                      <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{order.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
