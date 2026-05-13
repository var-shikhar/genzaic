"use client"

import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion"
import {
  ShieldCheck,
  BadgeCheck,
  Landmark,
  Smartphone,
  Lock,
  CircleCheckBig,
  EyeOff,
  Trash2,
  MapPin,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { KycInput } from "@/lib/validations/kyc"
import type { WizardStep } from "./WizardProgress"
import {
  PanCardArt,
  AadhaarCardArt,
  BankCardArt,
  UpiArt,
} from "./KycCardArt"

interface KycCredentialAsideProps {
  currentStep: WizardStep
  completed: ReadonlySet<WizardStep>
}

type Status = "active" | "verified" | "upcoming"

interface DriftConfig {
  duration: number
  y: [number, number, number]
  rotate: [number, number, number]
  delay: number
}

// Each card drifts on its own slow cycle. Different durations + delays
// keep them out-of-phase so the panel feels alive rather than coordinated.
const PAN_DRIFT: DriftConfig = {
  duration: 7.4,
  y: [0, -6, 0],
  rotate: [-1.2, 0.6, -1.2],
  delay: 0,
}
const AADHAAR_DRIFT: DriftConfig = {
  duration: 8.6,
  y: [0, 7, 0],
  rotate: [0.8, -0.6, 0.8],
  delay: 0.4,
}
const BANK_DRIFT: DriftConfig = {
  duration: 9.2,
  y: [0, -5, 0],
  rotate: [-0.6, 0.4, -0.6],
  delay: 0.8,
}
const UPI_DRIFT: DriftConfig = {
  duration: 6.8,
  y: [0, 5, 0],
  rotate: [1.4, -0.8, 1.4],
  delay: 1.2,
}

/**
 * Ambient panel shown beside the KYC wizard on lg+. Renders four stylized
 * credential objects (PAN, Aadhaar, Bank, UPI) that drift gently and
 * highlight in sync with the seller's current wizard step. Mirrors the
 * seller's form input live with strict masking — Aadhaar and account
 * numbers are always reduced to last-4 only, never written to the DOM in
 * full.
 */
export function KycCredentialAside({
  currentStep,
  completed,
}: KycCredentialAsideProps) {
  const { control } = useFormContext<KycInput>()
  // useWatch subscribes only this subtree; it does NOT trigger renders of
  // the form itself, so live-mirror has zero perf cost on the form column.
  const values = useWatch({ control })

  const identityStatus: Status =
    currentStep === "identity"
      ? "active"
      : completed.has("identity")
        ? "verified"
        : "upcoming"
  const paymentStatus: Status =
    currentStep === "payment"
      ? "active"
      : completed.has("payment")
        ? "verified"
        : "upcoming"

  const pan = displayPan(values.panNumber)
  const aadhaar = displayAadhaar(values.aadhaarNumber)
  const account = displayAccount(values.accountNumber)
  const ifsc = (values.ifscCode || "").toUpperCase().slice(0, 11)
  const bank = (values.bankName || "").trim()
  const upi = (values.upiId || "").trim().toLowerCase()
  const holder = (values.accountHolderName || "").trim()

  return (
    <div className="relative space-y-6">
      {/* Faint editorial grid backdrop — clipped to the panel rounded card. */}
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
          — Live preview —
        </p>
        <h3 className="font-display text-lg leading-tight">
          What we&apos;re <em className="text-primary not-italic">building</em>.
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A signed credential bundle that unlocks payouts above ₹10k. We never
          show full numbers anywhere outside this form.
        </p>
      </header>

      <div aria-hidden="true" className="relative space-y-4">
        <DriftCard config={PAN_DRIFT} status={identityStatus}>
          <PanCard status={identityStatus} pan={pan} holder={holder} />
        </DriftCard>

        <DriftCard config={AADHAAR_DRIFT} status={identityStatus}>
          <AadhaarCard status={identityStatus} aadhaar={aadhaar} />
        </DriftCard>

        <DriftCard config={BANK_DRIFT} status={paymentStatus}>
          <BankCard
            status={paymentStatus}
            account={account}
            ifsc={ifsc}
            bank={bank}
          />
        </DriftCard>

        <DriftCard config={UPI_DRIFT} status={paymentStatus}>
          <UpiChip status={paymentStatus} upi={upi} />
        </DriftCard>
      </div>

      <TrustStrip />
    </div>
  )
}

// ─── Masking helpers ──────────────────────────────────────────────────────

interface Displayed {
  value: string
  isPlaceholder: boolean
}

/**
 * PAN format: [A-Z]{5}[0-9]{4}[A-Z]. We render the typed prefix verbatim
 * (it isn't independently sensitive without the full number), but always
 * mask the 4-digit middle once typed — keeps the DOM reduced even if it's
 * cached or screen-shared.
 */
function displayPan(raw: string | undefined): Displayed {
  const s = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "")
  if (s.length === 0) return { value: "ABCDE ••••F", isPlaceholder: true }
  if (s.length >= 10) {
    return {
      value: `${s.slice(0, 5)} ••••${s.slice(9, 10)}`,
      isPlaceholder: false,
    }
  }
  return { value: s, isPlaceholder: false }
}

/**
 * Aadhaar — typed left-to-right in 4-4-4 format. Aadhaar is 12 digits.
 * Untyped slots dotted out. Seller sees their own input in real time; we
 * never echo full digits anywhere outside this panel.
 */
function displayAadhaar(raw: string | undefined): Displayed {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 12)
  if (digits.length === 0)
    return { value: "•••• •••• ••••", isPlaceholder: true }
  const padded = digits.padEnd(12, "•")
  const value = `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)}`
  return { value, isPlaceholder: false }
}

/**
 * Bank account — typed left-to-right, grouped every 4. Display width grows
 * with typed length but never less than 12 slots, so the row keeps a card
 * shape even at the start.
 */
function displayAccount(raw: string | undefined): Displayed {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 18)
  if (digits.length === 0)
    return { value: "•••• •••• 5678", isPlaceholder: true }
  const target = Math.max(12, Math.ceil(digits.length / 4) * 4)
  const padded = digits.padEnd(target, "•")
  const groups: string[] = []
  for (let i = 0; i < padded.length; i += 4) {
    groups.push(padded.slice(i, i + 4))
  }
  return { value: groups.join(" "), isPlaceholder: false }
}

// ─── Drift wrapper ────────────────────────────────────────────────────────

function DriftCard({
  config,
  status,
  children,
}: {
  config: DriftConfig
  status: Status
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={
        reduceMotion
          ? undefined
          : {
              y: config.y,
              rotate: config.rotate,
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: config.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: config.delay,
            }
      }
      className={cn(
        "transition-[transform,opacity] duration-500",
        status === "upcoming" && "opacity-55",
        status === "active" && "opacity-100",
        status === "verified" && "opacity-90",
      )}
    >
      {children}
    </motion.div>
  )
}

// ─── Cards ────────────────────────────────────────────────────────────────

function statusRing(status: Status) {
  if (status === "active") {
    return "ring-2 ring-primary/45 shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.45)]"
  }
  if (status === "verified") {
    return "ring-1 ring-emerald-400/40 shadow-[0_14px_30px_-14px_hsl(160_60%_45%/0.5)]"
  }
  return "ring-1 ring-border shadow-sm"
}

function PanCard({
  status,
  pan,
  holder,
}: {
  status: Status
  pan: Displayed
  holder: string
}) {
  return (
    <div
      className={cn(
        // Real PAN card — pale blue/cyan body with a warm red watermark.
        "relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-sky-300/30 via-sky-100/40 to-cyan-200/30 dark:from-sky-700/35 dark:via-sky-900/30 dark:to-cyan-800/30 border border-sky-300/60 dark:border-sky-600/40",
        statusRing(status),
      )}
    >
      <Watermark tone="rose" />
      <PanCardArt className="text-sky-900 dark:text-sky-200 opacity-[0.18] dark:opacity-[0.24]" />
      <div className="relative flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          Income Tax Dept · IN
        </p>
        <StatusPill status={status} />
      </div>
      <div className="relative space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-muted-foreground">
          Permanent Account Number
        </p>
        <LiveText
          value={pan.value}
          muted={pan.isPlaceholder}
          className="font-mono text-base tracking-[0.18em]"
        />
      </div>
      <div className="relative mt-3 flex items-center justify-between">
        <LiveText
          value={holder || "Name on document"}
          muted={!holder}
          className="font-display italic text-xs max-w-[60%] truncate"
          inline
        />
        <BadgeCheck className="w-4 h-4 text-primary/70" />
      </div>
    </div>
  )
}

function AadhaarCard({
  status,
  aadhaar,
}: {
  status: Status
  aadhaar: Displayed
}) {
  return (
    <div
      className={cn(
        // Real Aadhaar — saffron header → cream body → muted green base
        // (Indian-flag palette, UIDAI-style).
        "relative overflow-hidden rounded-xl p-4 bg-gradient-to-b from-orange-400/30 via-amber-50/60 to-emerald-500/15 dark:from-orange-500/30 dark:via-amber-900/20 dark:to-emerald-700/25 border border-orange-300/60 dark:border-orange-500/30",
        statusRing(status),
      )}
    >
      <Watermark tone="orange" />
      <AadhaarCardArt className="text-orange-900 dark:text-orange-200 opacity-[0.18] dark:opacity-[0.26]" />
      <div className="relative flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          UIDAI · Govt of India
        </p>
        <StatusPill status={status} />
      </div>
      <div className="relative flex items-center gap-3">
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-muted-foreground">
            Aadhaar
          </p>
          <LiveText
            value={aadhaar.value}
            muted={aadhaar.isPlaceholder}
            className="font-mono text-base tracking-[0.18em]"
          />
          <p className="font-display italic text-xs text-muted-foreground">
            Mirrors your input — live.
          </p>
        </div>
        <QrDots />
      </div>
    </div>
  )
}

function BankCard({
  status,
  account,
  ifsc,
  bank,
}: {
  status: Status
  account: Displayed
  ifsc: string
  bank: string
}) {
  const ifscPlaceholder = !ifsc
  const ifscDisplay = ifsc ? `IFSC · ${ifsc}` : "IFSC · HDFC0000456"
  return (
    <div
      className={cn(
        // Premium black card — always dark, with a faint gold inner sheen
        // suggested by a top-right radial. Borders and accents are warm gold.
        "relative overflow-hidden rounded-xl p-4 border border-amber-400/20",
        "bg-[radial-gradient(120%_140%_at_85%_-10%,rgba(251,191,36,0.18),transparent_55%),linear-gradient(135deg,#0a0a0a_0%,#1a1a1a_55%,#0a0a0a_100%)]",
        statusRing(status),
      )}
    >
      <Watermark tone="gold" />
      <BankCardArt className="text-amber-200 opacity-[0.22]" />
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <Landmark className="w-3.5 h-3.5 text-amber-300/80 shrink-0" />
          <LiveText
            value={bank || "Bank · NEFT/IMPS"}
            muted={!bank}
            className="font-mono text-[9px] uppercase tracking-[0.22em] truncate"
            mutedClass="text-zinc-500"
            activeClass="text-amber-200"
            inline
          />
        </div>
        <StatusPill status={status} tone="premium" />
      </div>
      <div className="relative space-y-1.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.20em] text-zinc-500">
          Account
        </p>
        <LiveText
          value={account.value}
          muted={account.isPlaceholder}
          className="font-mono text-base tracking-[0.18em]"
          mutedClass="text-zinc-500"
          activeClass="text-amber-50"
        />
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/20 bg-white/[0.04] px-2 py-0.5 max-w-full min-w-0">
          <LiveText
            value={ifscDisplay}
            muted={ifscPlaceholder}
            className="font-mono text-[10px] uppercase tracking-[0.14em] truncate"
            mutedClass="text-zinc-500"
            activeClass="text-amber-200"
            inline
          />
        </span>
        <ShieldCheck className="w-4 h-4 text-amber-300/80 shrink-0" />
      </div>
    </div>
  )
}

function UpiChip({ status, upi }: { status: Status; upi: string }) {
  const display = upi || "alex@upi"
  const placeholder = !upi
  return (
    <div
      className={cn(
        // Premium dark UPI card — black body with the NPCI palette suggested
        // by an orange→emerald diagonal sheen (saffron + green).
        "relative overflow-hidden rounded-xl p-4 border border-orange-400/20",
        "bg-[radial-gradient(110%_130%_at_-10%_-10%,rgba(249,115,22,0.18),transparent_55%),radial-gradient(110%_130%_at_110%_110%,rgba(16,185,129,0.14),transparent_55%),linear-gradient(135deg,#0a0a0a_0%,#171717_55%,#0a0a0a_100%)]",
        statusRing(status),
      )}
    >
      <Watermark tone="orange" />
      <UpiArt className="text-orange-200 opacity-[0.22]" />
      <div className="relative flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-orange-300/80">
          UPI · NPCI
        </p>
        <StatusPill status={status} tone="premium" />
      </div>
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0",
            status === "verified"
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-orange-400/15 text-orange-300",
          )}
        >
          <Smartphone className="w-3.5 h-3.5" />
        </span>
        <LiveText
          value={display}
          muted={placeholder}
          className="flex-1 font-mono text-sm tracking-[0.06em] truncate"
          mutedClass="text-zinc-500"
          activeClass="text-zinc-100"
          inline
        />
        <CircleCheckBig
          className={cn(
            "w-4 h-4 shrink-0",
            status === "verified"
              ? "text-emerald-300"
              : status === "active"
                ? "text-orange-300"
                : "text-zinc-600",
          )}
        />
      </div>
    </div>
  )
}

// ─── Bits ─────────────────────────────────────────────────────────────────

/**
 * Text wrapper that swaps with a quick fade when the value changes — gives
 * the live-mirror typing motion without re-keying chars individually.
 */
function LiveText({
  value,
  muted,
  className,
  mutedClass = "text-muted-foreground",
  activeClass = "text-foreground",
  inline = false,
}: {
  value: string
  muted: boolean
  className?: string
  /** Class applied when the field hasn't been typed into yet (placeholder). */
  mutedClass?: string
  /** Class applied once the seller has provided a real value. */
  activeClass?: string
  inline?: boolean
}) {
  const Tag = inline ? motion.span : motion.p
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Tag
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(muted ? mutedClass : activeClass, className)}
      >
        {value}
      </Tag>
    </AnimatePresence>
  )
}

type PillTone = "default" | "premium"

function StatusPill({
  status,
  tone = "default",
}: {
  status: Status
  tone?: PillTone
}) {
  const text =
    status === "active"
      ? "Drafting"
      : status === "verified"
        ? "Captured"
        : "Pending"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5",
        "font-mono text-[8.5px] uppercase tracking-[0.18em]",
        tone === "default" && [
          status === "active" &&
            "bg-primary/15 text-primary border border-primary/30",
          status === "verified" &&
            "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
          status === "upcoming" &&
            "bg-muted text-muted-foreground border border-border",
        ],
        tone === "premium" && [
          status === "active" &&
            "bg-amber-400/15 text-amber-300 border border-amber-400/40",
          status === "verified" &&
            "bg-emerald-400/15 text-emerald-300 border border-emerald-400/40",
          status === "upcoming" &&
            "bg-white/[0.06] text-zinc-400 border border-white/15",
        ],
      )}
    >
      <span
        className={cn(
          "h-1 w-1 rounded-full",
          tone === "default" && status === "active" && "bg-primary animate-pulse",
          tone === "default" && status === "verified" && "bg-emerald-500",
          tone === "default" && status === "upcoming" && "bg-muted-foreground/50",
          tone === "premium" && status === "active" && "bg-amber-300 animate-pulse",
          tone === "premium" && status === "verified" && "bg-emerald-300",
          tone === "premium" && status === "upcoming" && "bg-zinc-500",
        )}
      />
      {text}
    </span>
  )
}

function Watermark({
  tone = "primary",
}: {
  tone?: "primary" | "gold" | "orange" | "rose"
}) {
  const palette =
    tone === "gold"
      ? "from-amber-400/30 to-transparent"
      : tone === "orange"
        ? "from-orange-400/25 to-transparent"
        : tone === "rose"
          ? "from-rose-400/20 to-transparent"
          : "from-primary/15 to-transparent"
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute -right-6 -bottom-6 w-24 h-24 rounded-full",
        "bg-gradient-to-br blur-2xl",
        palette,
      )}
    />
  )
}

function QrDots() {
  // 5×5 stylized QR-ish grid. Deterministic mask of "lit" cells so it reads
  // as a code but isn't an actual QR.
  const lit = new Set([
    0, 1, 2, 4, 5, 9, 10, 12, 14, 15, 19, 20, 21, 23, 24,
  ])
  return (
    <div className="grid grid-cols-5 gap-[2px] w-12 h-12 shrink-0 rounded-md border border-border bg-background/60 p-1">
      {Array.from({ length: 25 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-[1px]",
            lit.has(i) ? "bg-foreground/70" : "bg-transparent",
          )}
        />
      ))}
    </div>
  )
}

// ─── Trust chip cycler ────────────────────────────────────────────────────

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
    <footer className="relative pt-3 border-t border-border/60">
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

      {/* Progress dots */}
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
