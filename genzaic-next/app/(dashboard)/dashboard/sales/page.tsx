"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  TrendingUp, ShoppingCart, Calendar, Clock, Search, Download,
  Eye, FileText, X, Package, Mail, Phone,
  CheckCircle2, XCircle, AlertCircle, ArrowUpDown, Filter,
} from "lucide-react"
import { toast } from "sonner"
import {
  useGetSalesStatsQuery, useGetOrdersQuery, useGetRecentOrdersQuery,
  useGetDownloadLogsQuery, type SalesOrder,
} from "@/store/api/salesApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const formatINR = (amount: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(Number(amount))

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  refunded: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
}

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  pending: AlertCircle,
  refunded: XCircle,
}

export default function SalesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  const { data: stats, isLoading: statsLoading } = useGetSalesStatsQuery()
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({})
  const { data: recentOrders, isLoading: recentLoading } = useGetRecentOrdersQuery()
  const { data: downloadLogs, isLoading: logsLoading } = useGetDownloadLogsQuery({})

  const handleExportCSV = () => {
    const rows = ordersData?.orders ?? []
    if (!rows.length) return
    const headers = ["Order ID", "Product", "Buyer Name", "Buyer Email", "Amount (₹)", "Status", "Date", "Downloads"]
    const csvRows = [
      headers.join(","),
      ...rows.map((o) =>
        [
          o.id,
          `"${o.productTitle.replace(/"/g, '""')}"`,
          `"${o.buyerName.replace(/"/g, '""')}"`,
          o.buyerEmail,
          Number(o.totalAmount).toFixed(2),
          o.status,
          new Date(o.createdAt).toLocaleDateString("en-IN"),
          `${o.downloadCount}/5`,
        ].join(",")
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredOrders = useMemo(() => {
    let orders = [...(ordersData?.orders ?? [])]
    if (search) {
      const q = search.toLowerCase()
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.productTitle.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.buyerEmail.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") orders = orders.filter((o) => o.status === statusFilter)
    switch (sortBy) {
      case "newest": orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case "oldest": orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case "amount-high": orders.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)); break
      case "amount-low": orders.sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount)); break
    }
    return orders
  }, [ordersData?.orders, search, statusFilter, sortBy])

  const statCards = [
    { label: "Total Revenue", value: formatINR(stats?.totalRevenue ?? 0), icon: TrendingUp, color: "bg-primary/10 text-primary" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" },
    { label: "This Month", value: formatINR(stats?.monthlyRevenue ?? 0), icon: Calendar, color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" },
    { label: "Pending", value: formatINR(stats?.pendingAmount ?? 0), icon: Clock, color: "bg-muted text-muted-foreground" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track your orders, downloads, and revenue</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={ordersLoading || !ordersData?.orders.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {statsLoading ? <Skeleton className="h-7 w-20 mt-1" /> : <p className="text-2xl font-bold">{stat.value}</p>}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="all-sales">All Sales</TabsTrigger>
          <TabsTrigger value="downloads">Download Logs</TabsTrigger>
        </TabsList>

        {/* All Sales */}
        <TabsContent value="all-sales" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders, products, buyers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
                <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                <SelectItem value="amount-low">Amount: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
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
                      const StatusIcon = statusIcons[order.status] ?? AlertCircle
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                {order.productThumbnail ? (
                                  <img src={order.productThumbnail} alt={order.productTitle} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <span className="font-medium line-clamp-1 max-w-[140px]">{order.productTitle}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{order.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                          </TableCell>
                          <TableCell className="font-semibold">{formatINR(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[order.status]}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(order.createdAt), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.downloadCount}/5
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => toast.success(`Invoice for ${order.id.slice(0, 8)} downloaded!`)}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              {!ordersLoading && filteredOrders.length === 0 && (
                <div className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Last 7 Days</CardTitle></CardHeader>
            <CardContent className="p-0">
              {recentLoading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
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
                    {(recentOrders ?? []).map((order) => {
                      const StatusIcon = statusIcons[order.status] ?? AlertCircle
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-medium">{order.productTitle}</TableCell>
                          <TableCell>{order.buyerName}</TableCell>
                          <TableCell className="font-semibold">{formatINR(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[order.status]}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
              {!recentLoading && !(recentOrders ?? []).length && (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No orders in the last 7 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Logs */}
        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Download Activity</CardTitle></CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
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
                    {(downloadLogs ?? []).map((log: { id: string; productTitle: string; buyerName: string; buyerEmail: string; downloadedAt: string; ipAddress?: string | null }) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.productTitle}</TableCell>
                        <TableCell>{log.buyerName}</TableCell>
                        <TableCell className="text-muted-foreground">{log.buyerEmail}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(log.downloadedAt), "dd MMM yyyy, hh:mm a")}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{log.ipAddress || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!logsLoading && !(downloadLogs ?? []).length && (
                <div className="py-12 text-center">
                  <Download className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
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
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6">
                    {/* Order info */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs">{selectedOrder.id.slice(0, 12)}...</Badge>
                        <Badge variant="outline" className={statusStyles[selectedOrder.status]}>{selectedOrder.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedOrder.createdAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                    </div>

                    <Separator />

                    {/* Product */}
                    <div>
                      <h3 className="font-semibold mb-3">Product</h3>
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {selectedOrder.productThumbnail ? (
                            <img src={selectedOrder.productThumbnail} alt={selectedOrder.productTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{selectedOrder.productTitle}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Buyer */}
                    <div>
                      <h3 className="font-semibold mb-3">Buyer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-14">Name:</span>
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
                      </div>
                    </div>

                    <Separator />

                    {/* Payment */}
                    <div>
                      <h3 className="font-semibold mb-3">Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatINR(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST (18%)</span>
                          <span>{formatINR(selectedOrder.gstAmount)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary">{formatINR(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Downloads */}
                    <div>
                      <h3 className="font-semibold mb-2">Downloads</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used</span>
                        <span>{selectedOrder.downloadCount} of 5</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="mt-6 flex gap-3">
                  <Button
                    className="flex-1 gradient-primary text-white"
                    onClick={() => { toast.success("Invoice downloaded!"); setSelectedOrder(null) }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
