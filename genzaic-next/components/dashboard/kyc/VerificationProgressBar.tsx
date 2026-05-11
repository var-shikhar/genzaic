"use client"

import { Check, Clock, X } from "lucide-react"
import type { KycData } from "@/lib/queries/kyc"
import { cn } from "@/lib/utils"

type StageState = "done" | "current" | "failed" | "upcoming"

interface Stage {
  id: string
  number: string
  label: string
  hint: string
  state: StageState
}

interface VerificationProgressBarProps {
  kyc: KycData
  className?: string
}

/**
 * Horizontal 4-stage progress bar showing where the seller's KYC is in the
 * pipeline: Submitted → Auto-verifying → Admin review → Verified.
 *
 *   ●─────●─────⋯─────○
 *   01    02    03    04
 *
 * Each stage's state is derived from the kyc record:
 *
 *   Submitted     - always "done" (the row exists)
 *   Auto-verify   - "done" when both pennyDrop & vpa = success
 *                   "failed" when either = failed
 *                   "current" otherwise (pending/error)
 *   Admin review  - "done" when verificationStatus = verified
 *                   "failed" when verificationStatus = rejected
 *                   "current" when status = pending AND auto-verify is done
 *                   "upcoming" when auto-verify hasn't finished yet
 *   Verified      - "done" when verificationStatus = verified, else "upcoming"
 */
export function VerificationProgressBar({
  kyc,
  className,
}: VerificationProgressBarProps) {
  const stages = deriveStages(kyc)

  return (
    <ol
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[repeat(4,minmax(0,1fr))] gap-2 sm:gap-0",
        "rounded-xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
      aria-label="Verification progress"
    >
      {stages.map((stage, idx) => (
        <li
          key={stage.id}
          className="relative flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2"
        >
          {/* Connector hairline (between this node and the next).
              Hidden on mobile (vertical stack). */}
          {idx < stages.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "hidden sm:block absolute top-3.5 left-[calc(50%+18px)] right-[calc(-50%+18px)] h-px",
                stages[idx + 1].state === "upcoming"
                  ? "bg-border"
                  : stages[idx + 1].state === "failed"
                    ? "bg-destructive/40"
                    : "bg-primary/40",
              )}
            />
          )}

          {/* Numbered/iconed dot */}
          <span
            className={cn(
              "relative inline-flex items-center justify-center w-7 h-7 rounded-full border shrink-0",
              "font-mono text-[10px] uppercase tracking-[0.10em]",
              stage.state === "done" &&
                "bg-emerald-500 text-white border-emerald-500",
              stage.state === "current" &&
                "bg-primary text-primary-foreground border-primary",
              stage.state === "failed" &&
                "bg-destructive text-destructive-foreground border-destructive",
              stage.state === "upcoming" &&
                "bg-transparent text-muted-foreground border-border",
            )}
          >
            {stage.state === "done" ? (
              <Check className="w-3.5 h-3.5" />
            ) : stage.state === "failed" ? (
              <X className="w-3.5 h-3.5" />
            ) : stage.state === "current" ? (
              <Clock className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              stage.number
            )}
          </span>

          <div className="flex-1 sm:mt-1">
            <div
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.16em]",
                stage.state === "done" &&
                  "text-emerald-700 dark:text-emerald-400 font-semibold",
                stage.state === "current" &&
                  "text-foreground font-semibold",
                stage.state === "failed" && "text-destructive font-semibold",
                stage.state === "upcoming" && "text-muted-foreground",
              )}
            >
              {stage.label}
            </div>
            <div
              className={cn(
                "font-display italic text-xs mt-0.5",
                stage.state === "upcoming"
                  ? "text-muted-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {stage.hint}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

// ─── Derivation ──────────────────────────────────────────────────────────────

function deriveStages(kyc: KycData): Stage[] {
  const status = kyc.verificationStatus
  const bankDone = kyc.pennyDropStatus === "success"
  const vpaDone = kyc.vpaStatus === "success"
  const bankFailed = kyc.pennyDropStatus === "failed"
  const vpaFailed = kyc.vpaStatus === "failed"
  const autoFailed = bankFailed || vpaFailed
  const autoDone = bankDone && vpaDone

  return [
    {
      id: "submitted",
      number: "01",
      label: "Submitted",
      hint: "Your details are with us.",
      state: "done",
    },
    {
      id: "verifying",
      number: "02",
      label: "Verifying",
      hint: autoFailed
        ? "Couldn't verify"
        : autoDone
          ? "Bank & UPI confirmed"
          : "Checking bank & UPI",
      state: autoFailed ? "failed" : autoDone ? "done" : "current",
    },
    {
      id: "admin-review",
      number: "03",
      label: "Admin review",
      hint:
        status === "verified"
          ? "Approved"
          : status === "rejected"
            ? "Rejected"
            : autoDone
              ? "Our team is reviewing your documents"
              : "Waits for verification",
      state:
        status === "verified"
          ? "done"
          : status === "rejected"
            ? "failed"
            : autoDone
              ? "current"
              : "upcoming",
    },
    {
      id: "verified",
      number: "04",
      label: "Verified",
      hint:
        status === "verified"
          ? "Payouts unlocked"
          : "Payouts unlock once verified",
      state: status === "verified" ? "done" : "upcoming",
    },
  ]
}
