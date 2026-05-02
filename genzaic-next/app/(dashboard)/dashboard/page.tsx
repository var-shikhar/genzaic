"use client"

import { useSession } from "next-auth/react"
import { useProductStats, useProducts } from "@/lib/queries/products"
import { useSalesStats } from "@/lib/queries/sales"
import { EditorsHeadline, Dateline, MonoLabel } from "@/components/brand/primitives"
import { OnYourDesk } from "@/components/dashboard/OnYourDesk"
import { ReaderMail } from "@/components/dashboard/ReaderMail"
import { WeekStrip } from "@/components/dashboard/WeekStrip"
import { NewsstandMention } from "@/components/dashboard/NewsstandMention"
import { formatCurrency } from "@/lib/utils"

export default function EditorsDeskPage() {
  const { data: session } = useSession()
  const { data: productStats } = useProductStats()
  const { data: salesStats } = useSalesStats()
  const { data: productsData } = useProducts({ page: 1, limit: 50 })

  const firstName = (session?.user?.name ?? "there").split(" ")[0]
  const draftCount = productsData?.products?.filter((p) => !p.isActive).length ?? 0
  const totalProducts = productStats?.totalProducts ?? 0

  return (
    <div className="space-y-10">
      <header className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-end pb-6 border-b border-primary/30">
        <div>
          <Dateline date={new Date()} prefix={`${totalProducts} products on the shelf`} />
          <EditorsHeadline accentWord="back," size="xl" className="mt-3">
            {`Welcome back, ${firstName}.`}
          </EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground mt-2">
            {draftCount > 0
              ? `${draftCount} ${draftCount === 1 ? "piece is" : "pieces are"} waiting for your eye.`
              : "A clear desk. Quiet shelves."}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground space-y-3">
            <div>
              <div className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground num-tabular">
                {formatCurrency(salesStats?.monthlyRevenue ?? 0)}
              </div>
              this month
            </div>
            <div>
              <div className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground num-tabular">
                {totalProducts} / {salesStats?.totalOrders ?? 0}
              </div>
              filed / sold
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
        <OnYourDesk />
        <ReaderMail />
      </div>

      <WeekStrip />

      <NewsstandMention />

      <MonoLabel className="block text-center pt-4 opacity-50">— end —</MonoLabel>
    </div>
  )
}
