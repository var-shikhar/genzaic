"use client"

import Image from "next/image"
import { FileText, Pencil } from "lucide-react"
import { useFormContext } from "react-hook-form"
import type { KycInput } from "@/lib/validations/kyc"
import { cn } from "@/lib/utils"
import type { WizardStep } from "./WizardProgress"
import { useKycDocuments } from "./KycDocumentContext"

interface StepReviewProps {
  /** Click an "Edit" link to jump back to a step. */
  onEdit: (step: WizardStep) => void
}

export function StepReview({ onEdit }: StepReviewProps) {
  const { getValues } = useFormContext<KycInput>()
  const v = getValues()
  const {
    panFile,
    panPreview,
    panIsPdf,
    panExistingUrl,
    aadhaarFile,
    aadhaarPreview,
    aadhaarIsPdf,
    aadhaarExistingUrl,
  } = useKycDocuments()

  const panThumb = panPreview ?? panExistingUrl
  const aadhaarThumb = aadhaarPreview ?? aadhaarExistingUrl

  return (
    <div className="space-y-6 py-8">
      <p className="font-display italic text-base text-muted-foreground">
        Almost there. Confirm everything below — we&apos;ll verify your bank
        account and UPI handle as soon as you submit.
      </p>

      <ReviewCard title="Identity" onEdit={() => onEdit("identity")}>
        <ReviewRow
          label="PAN"
          value={
            <span className="font-mono uppercase tracking-[0.04em]">
              {v.panNumber}
            </span>
          }
          thumbnail={
            panThumb ? (
              <DocThumb
                url={panThumb}
                isPdf={panFile ? panIsPdf : !!panThumb && panThumb.endsWith(".pdf")}
                fileName={panFile?.name ?? "PAN document"}
              />
            ) : null
          }
        />
        <ReviewRow
          label="Aadhaar"
          value={
            <span className="font-mono">
              {maskAadhaar(v.aadhaarNumber)}
            </span>
          }
          thumbnail={
            aadhaarThumb ? (
              <DocThumb
                url={aadhaarThumb}
                isPdf={
                  aadhaarFile
                    ? aadhaarIsPdf
                    : !!aadhaarThumb && aadhaarThumb.endsWith(".pdf")
                }
                fileName={aadhaarFile?.name ?? "Aadhaar document"}
              />
            ) : null
          }
        />
      </ReviewCard>

      <ReviewCard title="Payment" onEdit={() => onEdit("payment")}>
        <ReviewRow label="UPI ID" value={<span className="font-mono">{v.upiId}</span>} />
        <ReviewRow
          label="Bank account"
          value={
            <div className="space-y-0.5">
              <div className="font-display">{v.accountHolderName}</div>
              <div className="font-mono text-sm text-muted-foreground">
                {maskAccount(v.accountNumber)} · {v.ifscCode}
              </div>
              <div className="font-display italic text-sm text-muted-foreground">
                {v.bankName}
              </div>
            </div>
          }
        />
      </ReviewCard>
    </div>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:text-primary/80"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
      <dl className="space-y-4 divide-y divide-border [&>*+*]:pt-4">
        {children}
      </dl>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  thumbnail,
}: {
  label: string
  value: React.ReactNode
  thumbnail?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[120px_1fr_auto] gap-4 items-start">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground pt-1">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
      {thumbnail && <div className="shrink-0">{thumbnail}</div>}
    </div>
  )
}

function DocThumb({
  url,
  isPdf,
  fileName,
}: {
  url: string
  isPdf: boolean
  fileName: string
}) {
  if (isPdf) {
    return (
      <div
        className={cn(
          "w-16 h-12 rounded-md border border-border bg-muted/40",
          "flex flex-col items-center justify-center gap-0.5",
        )}
        title={fileName}
      >
        <FileText className="w-5 h-5 text-primary" />
        <span className="font-mono text-[8px] uppercase tracking-[0.10em] text-muted-foreground">
          PDF
        </span>
      </div>
    )
  }
  return (
    <div className="w-16 h-12 rounded-md overflow-hidden border border-border relative">
      <Image src={url} alt={fileName} fill sizes="64px" className="object-cover" />
    </div>
  )
}

function maskAccount(num: string): string {
  if (!num || num.length < 4) return num
  return "•••• " + num.slice(-4)
}

function maskAadhaar(num: string): string {
  if (!num || num.length < 4) return num
  return "XXXX XXXX " + num.slice(-4)
}
