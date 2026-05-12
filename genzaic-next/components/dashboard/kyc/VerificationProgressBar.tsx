"use client"

import { Check, Clock, X } from "lucide-react"
import type { KycData } from "@/lib/queries/kyc"
import { cn } from "@/lib/utils"

type StageState = "done" | "current" | "failed" | "upcoming"

interface Stage {
  id: string
  number: string
  label: string
  note: string
  state: StageState
}

interface VerificationProgressBarProps {
  kyc: KycData
  className?: string
}

/**
 * Vertical timeline showing the seller's KYC journey.
 *
 *   ●  Details Submitted
 *   │     12 May, 2:30pm
 *   │
 *   ●  Validation Process Starts
 *   │     Bank & UPI checks complete
 *   │
 *   ○  Any Issues or Revalidation
 *   │     Clear — nothing to fix
 *   │
 *   ○  Approved or Rejected
 *         Awaiting admin review
 *
 * Each stage's state derives from the kyc record:
 *
 *   1. Submitted   - always "done" once a row exists.
 *   2. Validation  - "current" while either Razorpay call is still
 *                    pending; "done" once both have a final result
 *                    (regardless of pass/fail — the *process* is done).
 *   3. Issues      - "upcoming" until validation completes;
 *                    "failed" when bank or UPI returned failed;
 *                    "done" when both passed (no issues found).
 *   4. Approved    - "done" on verified; "failed" on rejected;
 *                    "current" when validation done + status still pending;
 *                    "upcoming" otherwise.
 */
export function VerificationProgressBar({
  kyc,
  className,
}: VerificationProgressBarProps) {
  const stages = deriveStages(kyc)

  return (
    <ol
      className={cn(
        "rounded-xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
      aria-label="Verification timeline"
    >
      {stages.map((stage, idx) => (
        <li
          key={stage.id}
          className="grid grid-cols-[28px_1fr] gap-3 sm:gap-4"
        >
          {/* Dot + connector column */}
          <div className="flex flex-col items-center">
            <Dot stage={stage} />
            {idx < stages.length - 1 && (
              <ConnectorLine
                fromState={stage.state}
                toState={stages[idx + 1].state}
              />
            )}
          </div>

          {/* Content column */}
          <div className={cn(idx < stages.length - 1 ? "pb-5 sm:pb-6" : undefined)}>
            <div
              className={cn(
                "font-display text-base leading-tight",
                stage.state === "done" && "text-foreground font-medium",
                stage.state === "current" && "text-foreground font-semibold",
                stage.state === "failed" && "text-foreground font-semibold",
                stage.state === "upcoming" && "text-muted-foreground",
              )}
            >
              {stage.label}
            </div>
            <div
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.14em] mt-1.5",
                stage.state === "done" &&
                  "text-emerald-700 dark:text-emerald-400",
                stage.state === "current" && "text-primary",
                stage.state === "failed" && "text-destructive",
                stage.state === "upcoming" && "text-muted-foreground",
              )}
            >
              — {stage.note}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

// ─── Dot ────────────────────────────────────────────────────────────────────

function Dot({ stage }: { stage: Stage }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center w-7 h-7 rounded-full border shrink-0",
        "font-mono text-[10px] uppercase tracking-[0.08em]",
        stage.state === "done" && "bg-emerald-500 text-white border-emerald-500",
        stage.state === "current" &&
          "bg-primary text-primary-foreground border-primary",
        stage.state === "failed" &&
          "bg-destructive text-destructive-foreground border-destructive",
        stage.state === "upcoming" &&
          "bg-transparent text-muted-foreground border-border",
      )}
      aria-hidden="true"
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
  )
}

// ─── Connector line ──────────────────────────────────────────────────────────

function ConnectorLine({
  fromState,
  toState,
}: {
  fromState: StageState
  toState: StageState
}) {
  // The line takes the color of whichever end is "more advanced." Done > current
  // > failed > upcoming, semantically. Simpler heuristic: emerald only when both
  // ends are done or one's done and the other's a terminal failure (which still
  // means we got that far).
  const bothDone = fromState === "done" && toState === "done"
  const reachedFailure =
    fromState === "done" && (toState === "failed" || toState === "current")
  const cls = bothDone
    ? "bg-emerald-400/60"
    : reachedFailure
      ? "bg-primary/40"
      : "bg-border"
  return <span aria-hidden="true" className={cn("w-px flex-1 my-1.5 min-h-[24px]", cls)} />
}

// ─── State derivation ───────────────────────────────────────────────────────

function deriveStages(kyc: KycData): Stage[] {
  const status = kyc.verificationStatus
  const bankSettled =
    kyc.pennyDropStatus === "success" || kyc.pennyDropStatus === "failed"
  const vpaSettled = kyc.vpaStatus === "success" || kyc.vpaStatus === "failed"
  // Razorpay "error" (network / unconfigured) leaves vpa in a not-yet-known
  // state — we treat it as still in-progress so admin can re-trigger.
  const validationComplete = bankSettled && vpaSettled
  const hasIssues =
    kyc.pennyDropStatus === "failed" || kyc.vpaStatus === "failed"

  return [
    {
      id: "submitted",
      number: "01",
      label: "Details Submitted",
      note: formatSubmittedNote(kyc),
      state: "done",
    },
    {
      id: "validation",
      number: "02",
      label: "Validation Process Starts",
      note: validationComplete
        ? "Bank & UPI checks complete"
        : "Checking bank & UPI now",
      state: validationComplete ? "done" : "current",
    },
    {
      id: "issues",
      number: "03",
      label: "Any Issues or Revalidation",
      note: !validationComplete
        ? "Waits for validation"
        : hasIssues
          ? "Issues found — update the details below"
          : "Clear — nothing to fix",
      state: !validationComplete
        ? "upcoming"
        : hasIssues
          ? "failed"
          : "done",
    },
    {
      id: "final",
      number: "04",
      label: "Approved or Rejected",
      note:
        status === "verified"
          ? "Approved — payouts unlocked"
          : status === "rejected"
            ? "Rejected — see reason above"
            : !validationComplete
              ? "Waits for validation"
              : "Awaiting admin review (1–2 business days)",
      state:
        status === "verified"
          ? "done"
          : status === "rejected"
            ? "failed"
            : !validationComplete
              ? "upcoming"
              : "current",
    },
  ]
}

function formatSubmittedNote(kyc: KycData): string {
  try {
    const d = new Date(kyc.createdAt)
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Submitted"
  }
}
