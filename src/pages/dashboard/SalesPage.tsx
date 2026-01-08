import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  Clock,
  Search,
  Download,
  Eye,
  FileText,
  X,
  Package,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Loader2,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { salesAPI, Order, DownloadLog, SalesStats } from "@/lib/api/sales"
import { toast } from "sonner"
import { format } from "date-fns"

// Helper to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusColors = {
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  refunded: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusIcons = {
  completed: CheckCircle2,
  pending: AlertCircle,
  refunded: XCircle,
}

export default function SalesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [stats, setStats] = useState<SalesStats | null>(null)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [statusFilter, setStatusFilter] = useState("all")

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const [statsResponse, ordersResponse, recentResponse, logsResponse] = await Promise.all([
          salesAPI.getSalesStats(),
          salesAPI.getOrders(),
          salesAPI.getRecentOrders(),
          salesAPI.getDownloadLogs(),
        ])

        setStats(statsResponse.stats)
        setAllOrders(ordersResponse.orders || [])
        setRecentOrders(recentResponse.orders || [])
        setDownloadLogs(logsResponse.downloadLogs || [])
      } catch (error: any) {
        console.error("Failed to load sales data:", error)
        toast.error(error.message || "Failed to load sales data")
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter and sort orders locally
  const filteredOrders = useMemo(() => {
    let orders = [...allOrders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.productTitle.toLowerCase().includes(query) ||
          o.buyerName.toLowerCase().includes(query) ||
          o.buyerEmail.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter)
    }

    // Sort
    switch (sortBy) {
      case "newest":
        orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case "oldest":
        orders.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        break
      case "amount-high":
        orders.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
        break
      case "amount-low":
        orders.sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount))
        break
    }

    return orders
  }, [allOrders, searchQuery, statusFilter, sortBy])

  const handleDownloadInvoice = (order: Order) => {
    toast.success(`Invoice for ${order.id} downloaded!`)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a")
  }

  const formatShortDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy")
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (hasError || !stats) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Failed to Load Sales Data</h3>
          <p className="text-sm text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales</h1>
            <p className="text-muted-foreground">
              Track your orders, downloads, and revenue
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatINR(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatINR(stats.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatINR(stats.pendingAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-xl">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all-sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Orders</TabsTrigger>
            <TabsTrigger value="all-sales">All Sales</TabsTrigger>
            <TabsTrigger value="downloads">Download Logs</TabsTrigger>
          </TabsList>

          {/* All Sales Tab */}
          <TabsContent value="all-sales" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, products, or buyers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">
                    Amount: High to Low
                  </SelectItem>
                  <SelectItem value="amount-low">
                    Amount: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const StatusIcon = statusIcons[order.status]
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {order.productThumbnail ? (
                                  <img
                                    src={order.productThumbnail}
                                    alt={order.productTitle}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium line-clamp-1">
                                {order.productTitle}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.buyerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.buyerEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatINR(Number(order.totalAmount))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[order.status]}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatShortDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {order.downloadCount}/{order.maxDownloads}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadInvoice(order)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {filteredOrders.length === 0 && (
                  <div className="py-12 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Orders Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const StatusIcon = statusIcons[order.status]
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.productTitle}
                          </TableCell>
                          <TableCell>{order.buyerName}</TableCell>
                          <TableCell className="font-semibold">
                            {formatINR(Number(order.totalAmount))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[order.status]}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {recentOrders.length === 0 && (
                  <div className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No orders in the last 7 days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Download Logs Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Download Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Downloaded At</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloadLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.productTitle}
                        </TableCell>
                        <TableCell>{log.buyerName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.buyerEmail}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(log.downloadedAt)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.ipAddress || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {downloadLogs.length === 0 && (
                  <div className="py-12 text-center">
                    <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No downloads yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-card rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Order Details</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6">
                      {/* Order Info */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="font-mono">
                            {selectedOrder.id}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={statusColors[selectedOrder.status]}
                          >
                            {selectedOrder.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>

                      <Separator />

                      {/* Product */}
                      <div>
                        <h3 className="font-semibold mb-3">Product</h3>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            {selectedOrder.productThumbnail ? (
                              <img
                                src={selectedOrder.productThumbnail}
                                alt={selectedOrder.productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {selectedOrder.productTitle}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {selectedOrder.productDescription}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Buyer Info */}
                      <div>
                        <h3 className="font-semibold mb-3">
                          Buyer Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-20">
                              Name:
                            </span>
                            <span>{selectedOrder.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedOrder.buyerEmail}</span>
                          </div>
                          {selectedOrder.buyerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedOrder.buyerPhone}</span>
                            </div>
                          )}
                          {selectedOrder.buyerGstin && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground w-20">
                                GSTIN:
                              </span>
                              <span className="font-mono">
                                {selectedOrder.buyerGstin}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Details */}
                      <div>
                        <h3 className="font-semibold mb-3">Payment Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Base Amount
                            </span>
                            <span>{formatINR(Number(selectedOrder.amount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              GST (18%)
                            </span>
                            <span>{formatINR(Number(selectedOrder.gstAmount))}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-primary">
                              {formatINR(Number(selectedOrder.totalAmount))}
                            </span>
                          </div>
                          {selectedOrder.paymentMethod && (
                            <div className="flex items-center gap-2 pt-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Paid via {selectedOrder.paymentMethod}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Download Info */}
                      <div>
                        <h3 className="font-semibold mb-3">Downloads</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Used</span>
                          <span>
                            {selectedOrder.downloadCount} of{" "}
                            {selectedOrder.maxDownloads}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="mt-6 flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
