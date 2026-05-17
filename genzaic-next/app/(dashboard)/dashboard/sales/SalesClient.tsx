"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Search, Download,
  Eye, FileText, X, Package, Mail, Phone, User,
  CheckCircle2, XCircle, AlertCircle, ArrowUpDown, Filter, Calendar,
} from "lucide-react"
import { EditorsHeadline, EyebrowLabel, MonoLabel } from "@/components/brand/primitives"
import { Pinstripe } from "@/components/brand/motifs"
import { toast } from "sonner"
import {
  useSalesStats, useOrders, useRecentOrders, useDownloadLogs, useOrder,
  type SalesOrder,
} from "@/lib/queries/sales"
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

export function SalesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlOrderId = searchParams.get("orderId")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  const { data: stats, isLoading: statsLoading } = useSalesStats()
  const { data: ordersData, isLoading: ordersLoading } = useOrders({})
  const { data: recentOrders, isLoading: recentLoading } = useRecentOrders()
  const { data: downloadLogs, isLoading: logsLoading } = useDownloadLogs({})
  // Fall back to a single-order fetch when the deep-linked order isn't on
  // page 1 of the paginated list (rare but possible).
  const { data: deepLinkedOrder } = useOrder(urlOrderId ?? "")

  // Apply the ?orderId= deep link once on mount. Prefer the order from the
  // already-loaded list to avoid a redundant fetch; fall back to the
  // single-order endpoint when the list doesn't include it.
  const deepLinkAppliedRef = useRef(false)
  useEffect(() => {
    if (deepLinkAppliedRef.current || !urlOrderId) return
    const fromList = ordersData?.orders.find((o) => o.id === urlOrderId)
    if (fromList) {
      setSelectedOrder(fromList)
      deepLinkAppliedRef.current = true
      return
    }
    if (deepLinkedOrder && deepLinkedOrder.id === urlOrderId) {
      setSelectedOrder(deepLinkedOrder)
      deepLinkAppliedRef.current = true
    }
  }, [urlOrderId, ordersData, deepLinkedOrder])

  // Close the order detail sheet AND strip the ?orderId= param so the
  // deep-link doesn't re-trigger on the next render / back-nav.
  const closeOrderSheet = useCallback(() => {
    setSelectedOrder(null)
    if (urlOrderId) {
      router.replace("/dashboard/sales", { scroll: false })
    }
  }, [urlOrderId, router])

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
    { label: "Total revenue",  value: formatINR(stats?.totalRevenue ?? 0),   accent: true },
    { label: "Total orders",   value: String(stats?.totalOrders ?? 0) },
    { label: "This month",     value: formatINR(stats?.monthlyRevenue ?? 0) },
    { label: "Pending payout", value: formatINR(stats?.pendingAmount ?? 0) },
  ]

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <header className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end pb-6 border-b border-primary/30 overflow-hidden">
        <Pinstripe className="opacity-40" />
        <div className="relative">
          <EyebrowLabel>Ledger entries · this month</EyebrowLabel>
          <EditorsHeadline size="xl" className="mt-3">Receipts.</EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            Every sale a line entry, every reader noted.
          </p>
        </div>
        <Button variant="paper" onClick={handleExportCSV} disabled={ordersLoading || !ordersData?.orders.length} className="relative">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </header>

      {/* Stats — editorial cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="border border-border rounded-md p-5">
              <MonoLabel size="sm" className="block">{stat.label}</MonoLabel>
              {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className={`font-display text-3xl font-semibold tracking-[-0.025em] mt-2 num-tabular ${stat.accent ? "text-primary" : ""}`}>
                  {stat.value}
                </div>
              )}
            </div>
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
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                {order.productThumbnail ? (
                                  <Image
                                    src={order.productThumbnail}
                                    alt={order.productTitle}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
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
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Download invoice"
                                onClick={() =>
                                  window.open(
                                    `/api/checkout/order/${order.id}/invoice`,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
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
              )}
              {!ordersLoading && filteredOrders.length === 0 && (
                <div className="py-12 text-center">
                  <p className="font-display italic text-muted-foreground">No orders found.</p>
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
                <>
                  {/* Mobile: stacked cards (the 5-column table cannot fit a phone). */}
                  <ul className="md:hidden divide-y divide-border">
                    {(downloadLogs?.logs ?? []).map((log) => (
                      <li key={log.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-sm leading-tight break-words flex-1 min-w-0">
                            {log.productTitle}
                          </p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground shrink-0">
                            {format(new Date(log.downloadedAt), "dd MMM")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p className="truncate"><span className="text-foreground">{log.buyerName}</span> · {log.buyerEmail}</p>
                          <p className="font-mono">
                            {format(new Date(log.downloadedAt), "hh:mm a")} · {log.ipAddress || "N/A"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop: full table. */}
                  <div className="hidden md:block">
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
                        {(downloadLogs?.logs ?? []).map((log) => (
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
                  </div>
                </>
              )}
              {!logsLoading && !(downloadLogs?.logs ?? []).length && (
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
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={closeOrderSheet}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-card rounded-2xl shadow-xl"
              >
                <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <Button variant="ghost" size="icon" onClick={closeOrderSheet}>
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
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          {selectedOrder.productThumbnail ? (
                            <Image
                              src={selectedOrder.productThumbnail}
                              alt={selectedOrder.productTitle}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
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
                          <User className="w-4 h-4 text-muted-foreground" />
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
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `/api/checkout/order/${selectedOrder.id}/invoice`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                </div>
              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
