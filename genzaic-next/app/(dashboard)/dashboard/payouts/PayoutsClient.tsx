"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Building,
  Info,
  AlertCircle,
  ArrowRight,
  XCircle,
} from "lucide-react"
import { usePayoutStats, usePayouts, usePayout } from "@/lib/queries/payouts"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/utils"
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/config"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import { Pinstripe } from "@/components/brand/motifs"

export function PayoutsClient() {
  const { data: stats, isLoading: statsLoading } = usePayoutStats()
  const { data: payoutsData, isLoading: payoutsLoading } = usePayouts({})
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null)
  const { data: detail, isLoading: detailLoading } = usePayout(selectedPayoutId)

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-32" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Editorial header */}
      <header className="relative pb-6 border-b border-primary/30 overflow-hidden">
        <Pinstripe className="opacity-40" />
        <div className="relative">
          <EyebrowLabel>Balance sheet · {new Date().getFullYear()}</EyebrowLabel>
          <EditorsHeadline accentWord="Ledger." size="xl" className="mt-3">The Ledger.</EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            Your earnings, framed as a balance sheet.
          </p>
        </div>
      </header>

      {/* KYC Verification Notice */}
      {stats && !stats.kycVerified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                {stats.kycStatus === "not_submitted" && "KYC Verification Required"}
                {stats.kycStatus === "pending" && "KYC Under Review"}
                {stats.kycStatus === "rejected" && "KYC Verification Rejected"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {stats.kycStatus === "not_submitted" &&
                  "Complete your KYC verification to receive payouts to your bank account. This helps us ensure secure and compliant transactions."}
                {stats.kycStatus === "pending" &&
                  "Your KYC documents are under review. We'll notify you once the verification is complete. Payouts will be processed after verification."}
                {stats.kycStatus === "rejected" &&
                  "Your KYC verification was rejected. Please review the rejection reason and resubmit your documents to start receiving payouts."}
              </p>
              <Button asChild size="sm" className="gap-2">
                <Link href="/dashboard/kyc">
                  {stats.kycStatus === "not_submitted" && "Complete KYC Verification"}
                  {stats.kycStatus === "pending" && "View KYC Status"}
                  {stats.kycStatus === "rejected" && "Update KYC Details"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats — each card has a clarifying subtitle so the seller can tell
          where the number comes from (and that it's real, not a placeholder). */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Earnings",
            value: formatCurrency(stats?.totalEarnings ?? 0),
            subtitle: stats
              ? `From ${stats.lifetimeOrders} ${stats.lifetimeOrders === 1 ? "order" : "orders"} · all statuses`
              : "—",
            icon: TrendingUp,
            colorClass:
              "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
          },
          {
            title: "Eligible for Payout",
            value: formatCurrency(stats?.eligibleRevenue ?? 0),
            subtitle: stats
              ? `From ${stats.completedOrders} completed ${stats.completedOrders === 1 ? "order" : "orders"}`
              : "—",
            icon: Clock,
            colorClass:
              "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
          },
          {
            title: "Paid Out",
            value: formatCurrency(stats?.completedPayouts ?? 0),
            subtitle:
              (stats?.pendingPayouts ?? 0) > 0
                ? `${formatCurrency(stats?.pendingPayouts ?? 0)} in queue`
                : "Sent to your bank account",
            icon: CheckCircle,
            colorClass: "bg-primary/10 text-primary",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.colorClass}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium">{stat.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Payout Cycle: T+7</h3>
            <p className="text-sm text-muted-foreground">
              Your earnings are processed within 1 business day after successful payment.
              Payouts are automatically transferred to your verified bank account within 7 days.
              A minimum balance of {formatCurrency(MIN_WITHDRAWAL_AMOUNT)} is required for a payout.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bank Account - Only show if KYC verified */}
      {stats?.kycVerified && stats.bankAccount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Payout Account</h2>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              Verified
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Building className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{stats.bankAccount.bankName}</p>
              <p className="text-sm text-muted-foreground">
                {stats.bankAccount.accountNumber} • {stats.bankAccount.ifscCode}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Transaction History</h2>
          <p className="text-sm text-muted-foreground mt-1">Showing completed payouts only</p>
        </div>

        {payoutsLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : !payoutsData?.payouts.length ? (
          <div className="px-6 py-12 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Payouts Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {stats?.kycVerified
                ? "Your completed payouts will appear here. Start selling products to earn and receive payouts!"
                : "Complete your KYC verification to start receiving payouts for your sales."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Payout ID", "Amount", "UTR Number", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payoutsData.payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    onClick={() => setSelectedPayoutId(payout.id)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium">
                        {payout.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        {payout.utrNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          payout.status === "completed"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : payout.status === "pending"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                            : payout.status === "processing"
                            ? "bg-primary/10 text-primary"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {payout.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {payout.status === "pending" && <Clock className="w-3 h-3" />}
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
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

      {/* Payout detail Sheet — opens when a row is clicked. */}
      <Sheet
        open={Boolean(selectedPayoutId)}
        onOpenChange={(open) => {
          if (!open) setSelectedPayoutId(null)
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <EyebrowLabel>Payout detail</EyebrowLabel>
            <SheetTitle className="font-display text-3xl font-semibold tracking-[-0.02em]">
              {detail ? formatCurrency(detail.amount) : "—"}
            </SheetTitle>
            <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.15em]">
              {selectedPayoutId
                ? `ID · ${selectedPayoutId.substring(0, 8)}…`
                : ""}
            </SheetDescription>
          </SheetHeader>

          {detailLoading || !detail ? (
            <div className="space-y-3 mt-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <dl className="mt-8 divide-y divide-border">
              <DetailRow label="Status">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    detail.status === "completed"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : detail.status === "pending"
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                        : detail.status === "processing"
                          ? "bg-primary/10 text-primary"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}
                >
                  {detail.status === "completed" && <CheckCircle className="w-3 h-3" />}
                  {detail.status === "pending" && <Clock className="w-3 h-3" />}
                  {detail.status === "failed" && <XCircle className="w-3 h-3" />}
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </span>
              </DetailRow>

              <DetailRow label="UTR number">
                <span className="font-mono text-sm">
                  {detail.utrNumber || "—"}
                </span>
              </DetailRow>

              <DetailRow label="Transaction ID">
                <span className="font-mono text-sm">
                  {detail.transactionId || "—"}
                </span>
              </DetailRow>

              <DetailRow label="Created">
                <span className="font-mono text-sm">
                  {new Date(detail.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </DetailRow>

              <DetailRow label="Processed">
                <span className="font-mono text-sm">
                  {detail.processedAt
                    ? new Date(detail.processedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </DetailRow>

              {detail.failureReason && (
                <DetailRow label="Failure reason">
                  <span className="text-sm text-flicker">
                    {detail.failureReason}
                  </span>
                </DetailRow>
              )}
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

/** Editorial label/value row used inside the payout detail Sheet. */
function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 items-center py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}
