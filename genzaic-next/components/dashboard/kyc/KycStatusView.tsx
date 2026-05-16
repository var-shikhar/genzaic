"use client"

import { Pencil, RefreshCcw } from "lucide-react"
import type { KycData } from "@/lib/queries/kyc"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import { PostalRing } from "@/components/brand/motifs"
import { VerificationProgressBar } from "./VerificationProgressBar"
import { KycReviewAside } from "./KycReviewAside"
import type { EditSection } from "./KycSectionEdit"

interface KycStatusViewProps {
  kyc: KycData
  /** Open the focused edit form for one section. Only meaningful when the
   *  KYC is in a state where edits are allowed (rejected). */
  onEditSection: (section: EditSection) => void
}

/**
 * Read-only status page shown after submission. Replaces the wizard.
 * Three flavours — pending / verified / rejected. The horizontal progress
 * bar lives at the top so the seller always sees where their submission
 * is in the pipeline at a glance.
 *
 * On rejection the seller picks which section to fix (Identity or
 * Payment) and the parent renders KycSectionEdit for just that section,
 * not the full 3-step wizard.
 */
export function KycStatusView({ kyc, onEditSection }: KycStatusViewProps) {
  const status = kyc.verificationStatus
  const bankFailed = kyc.pennyDropStatus === "failed"
  const vpaFailed = kyc.vpaStatus === "failed"

  // Only the pending state gets the right-hand aside. Verified renders the
  // postal-ring stamp in the header; rejected uses the full width for the
  // "Fix & resubmit" callouts.
  const showAside = status === "pending"

  return (
    <div
      className={
        showAside
          ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] lg:gap-6 xl:gap-8"
          : "space-y-8 max-w-3xl"
      }
    >
      <div className="space-y-8 min-w-0 max-w-full">
        <header className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end pb-6 border-b border-primary/30">
          <div className="space-y-2">
            <EyebrowLabel>Verification</EyebrowLabel>
            <EditorsHeadline
              accentWord={
                status === "verified"
                  ? "Verified."
                  : status === "rejected"
                    ? "verify."
                    : "review."
              }
              size="xl"
            >
              {status === "verified" && "You're Verified."}
              {status === "rejected" && "We couldn't verify."}
              {status === "pending" && "Pending review."}
            </EditorsHeadline>
            <p className="font-display italic text-base text-muted-foreground">
              {status === "verified" &&
                "Your identity is on file. Payouts above ₹10k are unlocked."}
              {status === "rejected" &&
                "Something didn't check out. Update the relevant section below — we'll re-run verification right away."}
              {status === "pending" &&
                "Your details have been submitted. Our team typically reviews KYC submissions within 5–10 business days. We'll email you as soon as there's an update — feel free to close this page."}
            </p>
          </div>
          {status === "verified" && (
            <PostalRing variant="iris" rotate={-8}>
              Verified
              <br />
              {new Date().getFullYear()}
            </PostalRing>
          )}
        </header>

        {/* Horizontal 4-stage process bar */}
        <VerificationProgressBar kyc={kyc} />

        {/* Rejection alert */}
        {status === "rejected" && kyc.rejectionReason && (
          <Alert variant="destructive">
            <AlertTitle>Reason</AlertTitle>
            <AlertDescription>{kyc.rejectionReason}</AlertDescription>
          </Alert>
        )}

        {/* Targeted edit options on rejection. The seller picks the section
          that's failing — we don't force them through the full 3-step
          wizard again. */}
        {status === "rejected" && (
          <div className="space-y-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Fix &amp; resubmit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EditCallout
                title="Identity"
                detail="PAN or Aadhaar number / document"
                suggested={false}
                onClick={() => onEditSection("identity")}
              />
              <EditCallout
                title="Payment"
                detail={
                  bankFailed && vpaFailed
                    ? "Bank account & UPI both failed verification"
                    : bankFailed
                      ? "Bank account couldn't be verified"
                      : vpaFailed
                        ? "UPI handle couldn't be verified"
                        : "UPI handle / bank account"
                }
                suggested={bankFailed || vpaFailed}
                onClick={() => onEditSection("payment")}
              />
            </div>
          </div>
        )}
      </div>

      {showAside && (
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <KycReviewAside />
          </div>
        </aside>
      )}
    </div>
  )
}

// ─── Edit callout card ──────────────────────────────────────────────────────

function EditCallout({
  title,
  detail,
  suggested,
  onClick,
}: {
  title: string
  detail: string
  /** True when the rejection is most likely caused by a problem in this
   *  section (e.g. pennyDropStatus = failed → suggest editing Payment). */
  suggested: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        suggested
          ? "group flex items-start gap-3 p-4 rounded-xl border border-primary/40 bg-primary/5 text-left hover:border-primary hover:bg-primary/10 transition-colors"
          : "group flex items-start gap-3 p-4 rounded-xl border border-border bg-card text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
      }
    >
      <span
        aria-hidden="true"
        className={
          suggested
            ? "shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground"
            : "shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
        }
      >
        {suggested ? (
          <RefreshCcw className="w-3.5 h-3.5" />
        ) : (
          <Pencil className="w-3.5 h-3.5" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-base font-semibold tracking-[-0.01em]">
            {title}
          </span>
          {suggested && (
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
              Likely fix
            </span>
          )}
        </div>
        <p className="font-display italic text-sm text-muted-foreground mt-0.5 leading-snug">
          {detail}
        </p>
      </div>
    </button>
  )
}
