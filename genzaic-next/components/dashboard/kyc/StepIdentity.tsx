"use client"

import { Controller, useFormContext } from "react-hook-form"
import type { KycInput } from "@/lib/validations/kyc"
import { EditorialSection } from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KycDocumentDrop } from "./KycDocumentDrop"

interface StepIdentityProps {
  panFile: File | null
  panPreview: string | null
  panIsPdf: boolean
  /** Existing remote URL — shown when seller hasn't picked a new file yet
   *  but already had one from a previous submission. */
  panExistingUrl: string | null
  onPickPan: (file: File | null) => void

  aadhaarFile: File | null
  aadhaarPreview: string | null
  aadhaarIsPdf: boolean
  aadhaarExistingUrl: string | null
  onPickAadhaar: (file: File | null) => void
}

/**
 * Step 01 — PAN, Step 02 — Aadhaar. Both required.
 *
 * The dropzone shows a thumbnail of the picked file (or the previously
 * uploaded remote URL if the seller is resubmitting). On resubmit the
 * existing thumbnail acts as a "this is what was uploaded before" cue —
 * the seller still needs to re-pick to actually replace.
 */
export function StepIdentity({
  panFile,
  panPreview,
  panIsPdf,
  panExistingUrl,
  onPickPan,
  aadhaarFile,
  aadhaarPreview,
  aadhaarIsPdf,
  aadhaarExistingUrl,
  onPickAadhaar,
}: StepIdentityProps) {
  const { control, register, formState } = useFormContext<KycInput>()

  // Show the freshly-picked preview if any, otherwise fall back to the
  // existing remote URL from the previous submission.
  const panThumb = panPreview ?? panExistingUrl
  const aadhaarThumb = aadhaarPreview ?? aadhaarExistingUrl

  return (
    <div className="divide-y divide-border">
      <EditorialSection
        number="01"
        accentDigit="1"
        label="Identity — PAN"
        deck="Required for tax records (TDS / Form 16A). Needed before payouts above ₹10k."
      >
        {/* Two-column on ≥sm: number input fills the left column, the
            document drop sits in a fixed-width right column so it never
            balloons across half the page. Stacks on mobile. */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-5 sm:gap-6 items-start">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              PAN number
            </Label>
            <Controller
              control={control}
              name="panNumber"
              render={({ field }) => (
                <Input
                  variant="editorial"
                  className="font-mono text-base mt-1 uppercase"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                  aria-invalid={!!formState.errors.panNumber}
                />
              )}
            />
            {formState.errors.panNumber && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                — {formState.errors.panNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              PAN document
            </Label>
            <KycDocumentDrop
              preview={panThumb}
              fileName={panFile?.name ?? null}
              isPdf={panFile ? panIsPdf : false}
              onPick={onPickPan}
              helpText={
                panExistingUrl && !panFile
                  ? "Previous upload — re-upload to replace"
                  : undefined
              }
            />
          </div>
        </div>
      </EditorialSection>

      <EditorialSection
        number="02"
        accentDigit="2"
        label="Identity — Aadhaar"
        deck="Required for identity verification. Shown only as last 4 digits anywhere outside this form."
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-5 sm:gap-6 items-start">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Aadhaar number
            </Label>
            <Input
              variant="editorial"
              className="font-mono text-base mt-1"
              placeholder="XXXX XXXX XXXX"
              maxLength={12}
              inputMode="numeric"
              {...register("aadhaarNumber")}
              aria-invalid={!!formState.errors.aadhaarNumber}
            />
            {formState.errors.aadhaarNumber && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                — {formState.errors.aadhaarNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Aadhaar document
            </Label>
            <KycDocumentDrop
              preview={aadhaarThumb}
              fileName={aadhaarFile?.name ?? null}
              isPdf={aadhaarFile ? aadhaarIsPdf : false}
              onPick={onPickAadhaar}
              helpText={
                aadhaarExistingUrl && !aadhaarFile
                  ? "Previous upload — re-upload to replace"
                  : undefined
              }
            />
          </div>
        </div>
      </EditorialSection>
    </div>
  )
}
