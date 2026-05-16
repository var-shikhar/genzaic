"use client"

import { Controller, useFormContext } from "react-hook-form"
import type { KycInput } from "@/lib/validations/kyc"
import { EditorialSection } from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KycDocumentDrop } from "./KycDocumentDrop"
import { useKycDocuments } from "./KycDocumentContext"

/**
 * Step 01 — PAN, Step 02 — Aadhaar. Both required.
 *
 * The dropzone shows a thumbnail of the picked file (or the previously
 * uploaded remote URL if the seller is resubmitting). On resubmit the
 * existing thumbnail acts as a "this is what was uploaded before" cue —
 * the seller still needs to re-pick to actually replace.
 *
 * File state lives in `KycDocumentContext` so neither the wizard nor the
 * section-edit wrapper has to drill 10 props through this component.
 */
export function StepIdentity() {
  const { control, register, formState } = useFormContext<KycInput>()
  const {
    panFile,
    panPreview,
    panIsPdf,
    panExistingUrl,
    aadhaarFile,
    aadhaarPreview,
    aadhaarIsPdf,
    aadhaarExistingUrl,
    stageFile,
  } = useKycDocuments()

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
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_350px] gap-5 sm:gap-6 items-start">
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
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
              onPick={(f) => stageFile("pan", f)}
              hasAspect={false}
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
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_350px] gap-5 sm:gap-6 items-start">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Aadhaar number
            </Label>
            {(() => {
              const aadhaarReg = register("aadhaarNumber")
              return (
                <Input
                  variant="editorial"
                  className="font-mono text-base mt-1"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={12}
                  inputMode="numeric"
                  autoComplete="off"
                  {...aadhaarReg}
                  // Strip non-digits before RHF sees the value, so a stray
                  // keystroke (or paste with spaces/letters) can never enter
                  // form state and trip validation on submit.
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "")
                    if (digits !== e.target.value) {
                      e.target.value = digits
                    }
                    aadhaarReg.onChange(e)
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text")
                    if (/\D/.test(text)) {
                      e.preventDefault()
                      const digits = text.replace(/\D/g, "").slice(0, 12)
                      const input = e.currentTarget
                      const start = input.selectionStart ?? input.value.length
                      const end = input.selectionEnd ?? input.value.length
                      const next = (
                        input.value.slice(0, start) +
                        digits +
                        input.value.slice(end)
                      ).slice(0, 12)
                      input.value = next
                      aadhaarReg.onChange({
                        target: input,
                      } as unknown as React.ChangeEvent<HTMLInputElement>)
                    }
                  }}
                  aria-invalid={!!formState.errors.aadhaarNumber}
                />
              )
            })()}
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
              onPick={(f) => stageFile("aadhaar", f)}
              hasAspect={false}
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
