"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type WizardStep = "identity" | "payment" | "review"
export const WIZARD_STEP_ORDER: readonly WizardStep[] = [
  "identity",
  "payment",
  "review",
] as const

const STEP_META: Record<
  WizardStep,
  { number: string; label: string }
> = {
  identity: { number: "01", label: "Identity" },
  payment: { number: "02", label: "Payment" },
  review: { number: "03", label: "Review" },
}

interface WizardProgressProps {
  current: WizardStep
  /** Steps the user has visited & completed validation for. Clicking a
   *  completed step jumps back to it. Steps after `current` are upcoming. */
  completed: ReadonlySet<WizardStep>
  onJump: (step: WizardStep) => void
  className?: string
}

/**
 * Editorial-styled horizontal step strip for the KYC wizard.
 *
 *   [01 — Identity ●]   [02 — Payment ○]   [03 — Review ○]
 *
 * Filled iris dot for current/done, hollow for upcoming. Hairline
 * connectors between nodes. Mono uppercase typography to match the rest of
 * the dashboard's editorial OS.
 */
export function WizardProgress({
  current,
  completed,
  onJump,
  className,
}: WizardProgressProps) {
  return (
    <ol
      className={cn(
        "flex items-center gap-3 sm:gap-5 flex-wrap",
        className,
      )}
      aria-label="KYC progress"
    >
      {WIZARD_STEP_ORDER.map((step, idx) => {
        const meta = STEP_META[step]
        const isCurrent = current === step
        const isDone = completed.has(step) && !isCurrent
        const isFuture = !isCurrent && !isDone
        const clickable = isDone

        return (
          <li
            key={step}
            className="flex items-center gap-3 sm:gap-5"
            aria-current={isCurrent ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump(step)}
              className={cn(
                "flex items-center gap-2 group",
                clickable && "cursor-pointer",
                !clickable && "cursor-default",
              )}
            >
              {/* Numbered dot */}
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 rounded-full border transition-colors",
                  "font-mono text-[10px] uppercase tracking-[0.10em]",
                  isCurrent &&
                    "bg-primary text-primary-foreground border-primary",
                  isDone && "bg-emerald-500 text-white border-emerald-500",
                  isFuture &&
                    "bg-transparent text-muted-foreground border-border",
                )}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  meta.number
                )}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.18em]",
                  isCurrent && "text-foreground font-semibold",
                  isDone && "text-emerald-700 dark:text-emerald-400",
                  isFuture && "text-muted-foreground",
                )}
              >
                {meta.label}
              </span>
            </button>

            {/* Connector hairline (skipped after the last item) */}
            {idx < WIZARD_STEP_ORDER.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-10 sm:w-14",
                  isDone ? "bg-emerald-400/60" : "bg-border",
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
