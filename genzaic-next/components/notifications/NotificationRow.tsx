"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ShoppingBag, Package, FileCheck, FileX, UserPlus, Star, Wallet,
  AlertTriangle, Tag, TrendingDown, Sparkles, ShieldCheck, PartyPopper, Info, Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Notification } from "@/lib/db"

const ICONS: Record<Notification["type"], typeof Bell> = {
  order_placed: ShoppingBag,
  order_completed: Package,
  product_published: Sparkles,
  kyc_submitted: FileCheck,
  kyc_approved: ShieldCheck,
  kyc_rejected: FileX,
  new_follower: UserPlus,
  new_review: Star,
  payout_completed: Wallet,
  payout_failed: AlertTriangle,
  coupon_received: Tag,
  price_drop: TrendingDown,
  new_product_from_following: Sparkles,
  account_verified: ShieldCheck,
  welcome: PartyPopper,
  system: Info,
}

export function NotificationRow({
  notification,
  onClick,
  className,
}: {
  notification: Notification
  onClick?: () => void
  className?: string
}) {
  const Icon = ICONS[notification.type] ?? Bell
  const body = (
    <div className={cn("flex items-start gap-3 p-3 hover:bg-accent rounded-md", className)}>
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
        notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-semibold")}>{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onClick} className="block">
        {body}
      </Link>
    )
  }
  return <button type="button" onClick={onClick} className="block w-full text-left">{body}</button>
}
