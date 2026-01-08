/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
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
} from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { payoutsAPI, type Payout, type PayoutStats } from "@/lib/api/payouts"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PayoutsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [stats, setStats] = useState<PayoutStats | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        // Load stats and payouts in parallel
        const [statsResponse, payoutsResponse] = await Promise.all([
          payoutsAPI.getPayoutStats(),
          payoutsAPI.getPayouts({ status: "completed" }), // Only show completed payouts
        ])

        setStats(statsResponse.stats)
        setPayouts(payoutsResponse.payouts || [])
      } catch (error: any) {
        console.error("Failed to load payout data:", error)
        toast.error(error.message || "Failed to load payout data")
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const statsCards = stats
    ? [
        {
          title: "Total Earnings",
          value: `₹${Number(stats.totalEarnings).toLocaleString("en-IN")}`,
          icon: TrendingUp,
          color: "bg-accent-green/10 text-accent-green",
          iconColor: "text-accent-green",
        },
        {
          title: "Pending Payout",
          value: `₹${Number(stats.pendingPayouts).toLocaleString("en-IN")}`,
          icon: Clock,
          color: "bg-accent-orange/10 text-accent-orange",
          iconColor: "text-accent-orange",
        },
        {
          title: "Completed Payouts",
          value: `₹${Number(stats.completedPayouts).toLocaleString("en-IN")}`,
          icon: CheckCircle,
          color: "bg-primary/10 text-primary",
          iconColor: "text-primary",
        },
      ]
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings and payout status
          </p>
        </div>

        {/* KYC Verification Notice - Show if KYC not verified */}
        {stats && !stats.kycVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent-orange/5 border-2 border-accent-orange/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-accent-orange" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {stats.kycStatus === "not_submitted" &&
                    "KYC Verification Required"}
                  {stats.kycStatus === "pending" && "KYC Under Review"}
                  {stats.kycStatus === "rejected" &&
                    "KYC Verification Rejected"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {stats.kycStatus === "not_submitted" &&
                    "Complete your KYC verification to receive payouts to your bank account. This helps us ensure secure and compliant transactions."}
                  {stats.kycStatus === "pending" &&
                    "Your KYC documents are under review. We'll notify you once the verification is complete. Payouts will be processed after verification."}
                  {stats.kycStatus === "rejected" &&
                    "Your KYC verification was rejected. Please review the rejection reason and resubmit your documents to start receiving payouts."}
                </p>
                <Link to="/dashboard/kyc">
                  <Button size="sm" className="gap-2">
                    {stats.kycStatus === "not_submitted" &&
                      "Complete KYC Verification"}
                    {stats.kycStatus === "pending" && "View KYC Status"}
                    {stats.kycStatus === "rejected" && "Update KYC Details"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                >
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
              <h3 className="font-semibold text-foreground mb-1">
                Payout Cycle: T+7
              </h3>
              <p className="text-sm text-muted-foreground">
                Your earnings are processed within 1 business day after
                successful payment. Payouts are automatically transferred to
                your verified bank account.
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
                <p className="font-medium text-foreground">
                  {stats.bankAccount.bankName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.bankAccount.accountNumber} •{" "}
                  {stats.bankAccount.ifscCode}
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
            <h2 className="font-semibold text-foreground">
              Transaction History
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing completed payouts only
            </p>
          </div>

          {payouts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground mb-2">
                No Payouts Yet
              </h3>
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Payout ID
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      UTR Number
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
                  {payouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-foreground">
                          {payout.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">
                          ₹{Number(payout.amount).toLocaleString("en-IN")}
                        </span>
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
                              ? "bg-accent-green/10 text-accent-green"
                              : payout.status === "pending"
                              ? "bg-accent-orange/10 text-accent-orange"
                              : payout.status === "processing"
                              ? "bg-primary/10 text-primary"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {payout.status === "completed" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {payout.status === "pending" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {payout.status.charAt(0).toUpperCase() +
                            payout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(payout.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
