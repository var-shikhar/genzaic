"use client"

import { useEffect, useState } from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion"
import {
  ShieldCheck,
  Landmark,
  Smartphone,
  ScanLine,
  Stamp,
  Sparkles,
  Wallet,
  BadgeCheck,
  Lock,
  Trash2,
  MapPin,
  EyeOff,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Companion panel shown beside the KycStatusView on lg+ while the seller's
 * KYC is in `pending` review. Goal: give the page weight on the right so
 * the seller doesn't stare at empty space, and quietly communicate that
 * real humans are working on their submission.
 *
 *   ─ Review in progress ─
 *   Inside the review.
 *   What happens to your submission while you wait.
 *
 *   ● Identity match — PAN & Aadhaar
 *   ● Bank ownership — penny-drop
 *   ● UPI handle — VPA check
 *   ○ Risk & fraud screen
 *   ○ Final operator sign-off
 *
 *   What unlocks when verified
 *   – ₹10k+ payouts
 *   – Verified-creator badge
 *   – Faster checkout flow
 *
 *   [trust chip cycler]
 */
export function KycReviewAside() {
  return (
    <div className="relative space-y-5">
      {/* Faint editorial grid backdrop. Matches KycCredentialAside so the
          two asides feel like one design system. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl overflow-hidden",
          "[background-image:linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)]",
          "[background-size:28px_28px] text-foreground opacity-[0.05] dark:opacity-[0.09]",
          "[mask-image:radial-gradient(ellipse_70%_60%_at_center,black_0%,transparent_80%)]",
          "[-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_center,black_0%,transparent_80%)]",
        )}
      />

      <header className="relative space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          — Review in progress —
        </p>
        <h3 className="font-display text-lg leading-tight">
          Inside the <em className="text-primary not-italic">review</em>.
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          What happens to your submission while you wait. No action needed —
          we&apos;ll email you the moment there&apos;s an update.
        </p>
      </header>

      <ReviewChecklist />

      <UnlocksList />

      <TrustStrip />
    </div>
  )
}

// ─── Checklist with pulsing "currently looking at" cursor ────────────────────

interface ReviewItem {
  icon: LucideIcon
  label: string
  detail: string
}

const REVIEW_ITEMS: readonly ReviewItem[] = [
  {
    icon: BadgeCheck,
    label: "Identity match",
    detail: "PAN & Aadhaar cross-check",
  },
  {
    icon: Landmark,
    label: "Bank ownership",
    detail: "Penny-drop to your account",
  },
  {
    icon: Smartphone,
    label: "UPI handle",
    detail: "VPA name & validity",
  },
  {
    icon: ScanLine,
    label: "Risk & fraud screen",
    detail: "Sanctions, blocklists, signals",
  },
  {
    icon: Stamp,
    label: "Final operator sign-off",
    detail: "A human gives the green light",
  },
] as const

const CURSOR_INTERVAL_MS = 2400

function ReviewChecklist() {
  const [cursor, setCursor] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(
      () => setCursor((p) => (p + 1) % REVIEW_ITEMS.length),
      CURSOR_INTERVAL_MS,
    )
    return () => clearInterval(t)
  }, [reduceMotion])

  return (
    <ol className="relative space-y-3">
      {REVIEW_ITEMS.map((item, idx) => {
        const Icon = item.icon
        const isActive = idx === cursor && !reduceMotion
        return (
          <li
            key={item.label}
            className={cn(
              "relative flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-500",
              isActive
                ? "border-primary/40 bg-primary/[0.04]"
                : "border-border bg-card/40",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-500",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-display text-sm leading-tight transition-colors duration-500",
                  isActive ? "text-foreground" : "text-foreground/85",
                )}
              >
                {item.label}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-1 truncate">
                — {item.detail}
              </p>
            </div>
            {/* Pulsing dot on the active row to suggest real motion behind
                the scenes. The cursor advances every CURSOR_INTERVAL_MS so
                the panel always has something visibly happening. */}
            <span
              aria-hidden="true"
              className={cn(
                "relative shrink-0 mt-1.5 inline-flex h-2 w-2",
                !isActive && "opacity-0",
              )}
            >
              <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// ─── What you unlock ────────────────────────────────────────────────────────

interface UnlockItem {
  icon: LucideIcon
  text: string
}

const UNLOCKS: readonly UnlockItem[] = [
  { icon: Wallet, text: "Payouts above ₹10,000 / mo" },
  { icon: Sparkles, text: "Verified-creator badge" },
  { icon: ShieldCheck, text: "Faster, signed checkout flow" },
] as const

function UnlocksList() {
  return (
    <section className="relative space-y-2 pt-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        — What unlocks when verified —
      </p>
      <ul className="space-y-1.5">
        {UNLOCKS.map((u) => {
          const Icon = u.icon
          return (
            <li
              key={u.text}
              className="flex items-center gap-2.5 text-[13px] text-foreground/85"
            >
              <Icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="font-display leading-tight">{u.text}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ─── Trust chip cycler (mirrors KycCredentialAside's footer) ───────────────

interface TrustChip {
  icon: LucideIcon
  text: string
}

const TRUST_CHIPS: readonly TrustChip[] = [
  { icon: Lock, text: "AES-256 in transit" },
  { icon: ShieldCheck, text: "RBI penny-drop verified" },
  { icon: EyeOff, text: "Last-4 only · ever" },
  { icon: Trash2, text: "Files purged 30d post-verify" },
  { icon: MapPin, text: "Hosted in India · ISO 27001" },
] as const

const CHIP_INTERVAL_MS = 3200

function TrustStrip() {
  const [i, setI] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const t = setInterval(
      () => setI((p) => (p + 1) % TRUST_CHIPS.length),
      CHIP_INTERVAL_MS,
    )
    return () => clearInterval(t)
  }, [reduceMotion])

  const chip = TRUST_CHIPS[i]!
  const Icon = chip.icon

  return (
    <footer className="relative pt-2 border-t border-border/60">
      <div className="relative h-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center gap-2 text-[11px] text-muted-foreground"
          >
            <Icon className="w-3 h-3 shrink-0" />
            <span className="font-mono uppercase tracking-[0.14em] truncate">
              {chip.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {TRUST_CHIPS.map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-[3px] rounded-full transition-all duration-500",
              idx === i ? "w-5 bg-primary/70" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>
    </footer>
  )
}
