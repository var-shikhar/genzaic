import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardAPI, DashboardStats, RecentOrder } from '@/lib/api/dashboard';
import { toast } from "@/lib/toast";

export default function DashboardHome() {
  const { user } = useAuth();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [stats, orders] = await Promise.all([
          dashboardAPI.getDashboardStats(),
          dashboardAPI.getRecentOrders(5),
        ]);
        
        setDashboardStats(stats);
        setRecentOrders(orders);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare stats array from fetched data
  const stats = dashboardStats ? [
    {
      title: 'Total Sales',
      value: formatINR(dashboardStats.totalSales),
      change: dashboardStats.salesChange || '',
      icon: TrendingUp,
      color: 'from-accent-green to-green-600',
      bgColor: 'bg-accent-green/10',
    },
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders.toString(),
      change: dashboardStats.ordersChange || '',
      icon: ShoppingCart,
      color: 'from-accent-purple to-purple-600',
      bgColor: 'bg-accent-purple/10',
    },
    {
      title: 'Products',
      value: dashboardStats.totalProducts.toString(),
      change: '',
      icon: Package,
      color: 'from-accent-orange to-orange-600',
      bgColor: 'bg-accent-orange/10',
    },
    {
      title: 'Pending Payout',
      value: formatINR(dashboardStats.pendingPayout),
      change: 'T+1',
      icon: Wallet,
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10',
    },
  ] : [];

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
            <Button className="gap-2 bg-primary hover:opacity-90">
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-6 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="w-16 h-6 rounded-full bg-muted" />
                </div>
                <div className="w-24 h-8 bg-muted rounded mb-2" />
                <div className="w-32 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Failed to load dashboard data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && !error && (
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
        )}

        {/* Quick Actions & Recent Orders */}
        {!isLoading && !error && (
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
                to="/dashboard/sales"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sales</p>
                  <p className="text-xs text-muted-foreground">View orders & invoices</p>
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
              <Link to="/dashboard/sales" className="text-sm text-primary hover:underline">
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
        )}
      </div>
    </DashboardLayout>
  );
}
