"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"
import { usePreferences, useUpdatePreference } from "@/hooks/use-notifications"

type TypeInfo = { type: string; label: string; description: string; group: string }

const TYPES: TypeInfo[] = [
  { type: "order_placed",       label: "Order placed",        description: "A buyer placed an order",            group: "Commerce" },
  { type: "order_completed",    label: "Order completed",     description: "Your purchase is ready",             group: "Commerce" },
  { type: "product_published",  label: "Product published",   description: "Your product went live",             group: "Commerce" },
  { type: "coupon_received",    label: "Coupon received",     description: "You received a discount code",       group: "Commerce" },
  { type: "price_drop",         label: "Price drop",          description: "Something in your wishlist is cheaper", group: "Commerce" },
  { type: "new_product_from_following", label: "New from creators you follow", description: "Creators you follow shipped something", group: "Commerce" },
  { type: "kyc_submitted",      label: "KYC submitted",       description: "Your KYC is in review",              group: "KYC" },
  { type: "kyc_approved",       label: "KYC approved",        description: "Your KYC was approved",              group: "KYC" },
  { type: "kyc_rejected",       label: "KYC rejected",        description: "Your KYC needs attention",           group: "KYC" },
  { type: "account_verified",   label: "Account verified",    description: "Your email/account was verified",    group: "KYC" },
  { type: "payout_completed",   label: "Payout completed",    description: "A payout landed in your bank",       group: "Payouts" },
  { type: "payout_failed",      label: "Payout failed",       description: "A payout couldn't be sent",          group: "Payouts" },
  { type: "new_follower",       label: "New follower",        description: "Someone started following you",      group: "Social" },
  { type: "new_review",         label: "New review",          description: "Someone reviewed your product",      group: "Social" },
  { type: "welcome",            label: "Welcome",             description: "Welcome message",                    group: "System" },
  { type: "system",             label: "System",              description: "Platform announcements",             group: "System" },
]

const GROUPS = ["Commerce", "KYC", "Payouts", "Social", "System"] as const

export function NotificationPreferences() {
  const { data: prefs, isLoading } = usePreferences()
  const { mutate: update } = useUpdatePreference()

  const byType = useMemo(() => {
    const map = new Map<string, { inAppEnabled: boolean; emailEnabled: boolean }>()
    for (const p of prefs ?? []) {
      map.set(p.notificationType, { inAppEnabled: p.inAppEnabled, emailEnabled: p.emailEnabled })
    }
    return map
  }, [prefs])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </CardTitle>
        <CardDescription>Choose how you want to hear from us for each event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          GROUPS.map((group) => (
            <div key={group}>
              <h3 className="text-sm font-semibold mb-3">{group}</h3>
              <div className="space-y-3">
                {TYPES.filter((t) => t.group === group).map((t) => {
                  const current = byType.get(t.type) ?? { inAppEnabled: true, emailEnabled: true }
                  return (
                    <div
                      key={t.type}
                      className="grid grid-cols-[1fr,auto,auto] items-center gap-4 py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase text-muted-foreground">In-app</span>
                        <Switch
                          checked={current.inAppEnabled}
                          onCheckedChange={(v) =>
                            update({
                              notificationType: t.type,
                              inAppEnabled: v,
                              emailEnabled: current.emailEnabled,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase text-muted-foreground">Email</span>
                        <Switch
                          checked={current.emailEnabled}
                          onCheckedChange={(v) =>
                            update({
                              notificationType: t.type,
                              inAppEnabled: current.inAppEnabled,
                              emailEnabled: v,
                            })
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
