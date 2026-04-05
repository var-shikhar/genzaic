"use client"

import Link from "next/link"
import { useGetSalesStatsQuery, useGetRecentOrdersQuery } from "@/store/api/salesApi"
import { useGetProductStatsQuery } from "@/store/api/productsApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IndianRupee, Package, ShoppingCart, Wallet, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { formatCurrency, formatRelativeTime } from "@/lib/utils"

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  loading,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
        )}
        {change && !loading && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: salesStats, isLoading: statsLoading } = useGetSalesStatsQuery()
  const { data: productStats, isLoading: productStatsLoading } = useGetProductStatsQuery()
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrdersQuery()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Button asChild className="gradient-primary text-white gap-2 w-full sm:w-auto shadow-md shadow-primary/20">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(salesStats?.totalRevenue ?? 0)}
          icon={IndianRupee}
          change={salesStats?.salesChange}
          loading={statsLoading}
        />
        <StatCard
          title="Total Orders"
          value={salesStats?.totalOrders ?? 0}
          icon={ShoppingCart}
          change={salesStats?.ordersChange}
          loading={statsLoading}
        />
        <StatCard
          title="Products"
          value={productStats?.totalProducts ?? 0}
          icon={Package}
          loading={productStatsLoading}
        />
        <StatCard
          title="Pending Payout"
          value={formatCurrency(salesStats?.pendingAmount ?? 0)}
          icon={Wallet}
          loading={statsLoading}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href="/dashboard/sales">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentOrders?.length ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">Share your storefront to start selling</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium max-w-[150px] sm:max-w-[200px] truncate">{order.productTitle}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <p className="text-sm">{order.buyerName}</p>
                        <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "completed" ? "success" : "warning"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatRelativeTime(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
