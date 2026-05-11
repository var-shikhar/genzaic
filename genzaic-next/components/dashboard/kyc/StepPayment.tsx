"use client"

import { useEffect, useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import type { KycInput } from "@/lib/validations/kyc"
import { EditorialSection } from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/

interface IfscLookupResponse {
  BANK?: string
  BRANCH?: string
}

/**
 * Step 03 — UPI, Step 04 — Bank account.
 *
 * IFSC auto-fill: when the seller enters a valid IFSC, we hit Razorpay's
 * free public lookup (https://ifsc.razorpay.com/{IFSC}) and populate
 * `bankName`. Failures are silent — seller can still type the bank name
 * manually.
 */
export function StepPayment() {
  const { control, register, setValue, watch, formState } =
    useFormContext<KycInput>()

  const ifscValue = watch("ifscCode")
  // Track which IFSC we last looked up so we don't refetch on every keystroke.
  const lastLookedUp = useRef<string | null>(null)

  useEffect(() => {
    const ifsc = (ifscValue ?? "").toUpperCase()
    if (!IFSC_RE.test(ifsc) || lastLookedUp.current === ifsc) return
    lastLookedUp.current = ifsc

    const controller = new AbortController()
    fetch(`https://ifsc.razorpay.com/${ifsc}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: IfscLookupResponse | null) => {
        if (data?.BANK) {
          setValue("bankName", data.BANK, { shouldDirty: true, shouldValidate: true })
        }
      })
      .catch(() => {
        // Silent failure — sellers can still type the bank name manually.
      })

    return () => controller.abort()
  }, [ifscValue, setValue])

  return (
    <div className="divide-y divide-border">
      <EditorialSection
        number="03"
        accentDigit="3"
        label="Payment — UPI"
        deck="Where your earnings land. We verify the handle exists when you submit."
      >
        <div>
          <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            UPI ID
          </Label>
          <Input
            variant="editorial"
            className="font-mono text-base mt-1"
            placeholder="shikhar@oksbi"
            {...register("upiId")}
            aria-invalid={!!formState.errors.upiId}
          />
          {formState.errors.upiId && (
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
              — {formState.errors.upiId.message}
            </p>
          )}
        </div>
      </EditorialSection>

      <EditorialSection
        number="04"
        accentDigit="4"
        label="Payment — Bank account"
        deck="Used as fallback when UPI fails or for amounts above UPI limits."
      >
        <div className="space-y-5">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Account holder name
            </Label>
            <Input
              variant="editorial"
              className="font-display text-base mt-1"
              placeholder="As per your bank records"
              {...register("accountHolderName")}
              aria-invalid={!!formState.errors.accountHolderName}
            />
            {formState.errors.accountHolderName && (
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                — {formState.errors.accountHolderName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Account number
              </Label>
              <Input
                variant="editorial"
                type="password"
                className="font-mono text-base mt-1"
                placeholder="••••••••"
                {...register("accountNumber")}
                aria-invalid={!!formState.errors.accountNumber}
              />
              {formState.errors.accountNumber && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                  — {formState.errors.accountNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Confirm account number
              </Label>
              <Input
                variant="editorial"
                className="font-mono text-base mt-1"
                placeholder="Re-enter account number"
                {...register("confirmAccountNumber")}
                aria-invalid={!!formState.errors.confirmAccountNumber}
              />
              {formState.errors.confirmAccountNumber && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                  — {formState.errors.confirmAccountNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                IFSC code
              </Label>
              <Controller
                control={control}
                name="ifscCode"
                render={({ field }) => (
                  <Input
                    variant="editorial"
                    className="font-mono text-base mt-1 uppercase"
                    placeholder="SBIN0001234"
                    maxLength={11}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    aria-invalid={!!formState.errors.ifscCode}
                  />
                )}
              />
              {formState.errors.ifscCode && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                  — {formState.errors.ifscCode.message}
                </p>
              )}
            </div>

            <div>
              <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Bank name
              </Label>
              <Input
                variant="editorial"
                className="font-display text-base mt-1"
                placeholder="State Bank of India"
                {...register("bankName")}
                aria-invalid={!!formState.errors.bankName}
              />
              {formState.errors.bankName && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                  — {formState.errors.bankName.message}
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                Auto-fills from IFSC
              </p>
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  )
}
