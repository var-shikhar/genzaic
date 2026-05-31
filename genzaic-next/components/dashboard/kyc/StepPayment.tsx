"use client"

import { useEffect, useRef, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react"
import type { KycInput } from "@/lib/validations/kyc"
import { EditorialSection } from "@/components/brand/primitives"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { INDIAN_BANKS, findBankByName } from "@/lib/data/indian-banks"

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
 * `bankName` by canonicalising the response against our known-banks list.
 * Failures are silent — seller can still pick the bank from the dropdown.
 */
export function StepPayment() {
  const { control, register, setValue, watch, formState } =
    useFormContext<KycInput>()

  const ifscValue = watch("ifscCode")
  // Track which IFSC we last looked up so we don't refetch on every keystroke.
  const lastLookedUp = useRef<string | null>(null)

  const [showAccount, setShowAccount] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const ifsc = (ifscValue ?? "").toUpperCase()
    if (!IFSC_RE.test(ifsc) || lastLookedUp.current === ifsc) return
    lastLookedUp.current = ifsc

    const controller = new AbortController()
    fetch(`https://ifsc.razorpay.com/${ifsc}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: IfscLookupResponse | null) => {
        if (data?.BANK) {
          // Map the IFSC response onto a canonical entry from our list so
          // the dropdown shows a checkmark next to the matched bank.
          const matched = findBankByName(data.BANK) ?? data.BANK
          setValue("bankName", matched, { shouldDirty: true, shouldValidate: true })
        }
      })
      .catch(() => {
        // Silent failure — sellers can still pick the bank manually.
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
          <Controller
            control={control}
            name="upiId"
            render={({ field }) => (
              <Input
                variant="editorial"
                className="font-mono text-base mt-1 lowercase"
                placeholder="shikhar@oksbi"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={field.value ?? ""}
                // Force lowercase + strip whitespace before RHF sees it,
                // so a paste of "Name @OkSbi " becomes "name@oksbi".
                onChange={(e) =>
                  field.onChange(e.target.value.toLowerCase().replace(/\s+/g, ""))
                }
                aria-invalid={!!formState.errors.upiId}
              />
            )}
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
              <Controller
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <DigitInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={showAccount ? "Account number" : "••••••••"}
                    masked={!showAccount}
                    onToggle={() => setShowAccount((s) => !s)}
                    invalid={!!formState.errors.accountNumber}
                    ariaLabel="Account number"
                  />
                )}
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
              <Controller
                control={control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <DigitInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={showConfirm ? "Re-enter account number" : "••••••••"}
                    masked={!showConfirm}
                    onToggle={() => setShowConfirm((s) => !s)}
                    invalid={!!formState.errors.confirmAccountNumber}
                    ariaLabel="Confirm account number"
                  />
                )}
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
              <Controller
                control={control}
                name="bankName"
                render={({ field }) => (
                  <BankPicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    invalid={!!formState.errors.bankName}
                  />
                )}
              />
              {formState.errors.bankName && (
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flicker mt-1">
                  — {formState.errors.bankName.message}
                </p>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
                Auto-fills from IFSC · tap to change
              </p>
            </div>
          </div>
        </div>
      </EditorialSection>
    </div>
  )
}

// ─── DigitInput ──────────────────────────────────────────────────────────────
// Numeric-only field with a show/hide toggle. Strips non-digits on every
// keystroke so a paste of "1234-5678" becomes "12345678".

interface DigitInputProps {
  value: string
  onChange: (v: string) => void
  placeholder: string
  masked: boolean
  onToggle: () => void
  invalid: boolean
  ariaLabel: string
}

function DigitInput({
  value,
  onChange,
  placeholder,
  masked,
  onToggle,
  invalid,
  ariaLabel,
}: DigitInputProps) {
  return (
    <div className="relative mt-1">
      <Input
        variant="editorial"
        type={masked ? "password" : "text"}
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={18}
        className="font-mono text-base pr-8"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        aria-invalid={invalid}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={masked ? "Show account number" : "Hide account number"}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
        tabIndex={-1}
      >
        {masked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ─── BankPicker ──────────────────────────────────────────────────────────────
// Searchable dropdown over INDIAN_BANKS. If the IFSC lookup produced a name
// not in our list we still display it on the trigger — the user can override
// by opening the dropdown and picking a different bank, but cannot free-type.

interface BankPickerProps {
  value: string
  onChange: (v: string) => void
  invalid: boolean
}

function BankPicker({ value, onChange, invalid }: BankPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "mt-1 flex h-9 w-full items-center justify-between border-0 border-b border-foreground/20",
            "bg-transparent text-left text-base font-display",
            "hover:border-foreground/40 focus-visible:outline-none focus-visible:border-foreground",
            "transition-colors",
          )}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Select your bank"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search bank…" className="font-display" />
          <CommandList>
            <CommandEmpty className="font-display italic text-sm text-muted-foreground">
              No bank found.
            </CommandEmpty>
            <CommandGroup>
              {INDIAN_BANKS.map((bank) => (
                <CommandItem
                  key={bank}
                  value={bank}
                  onSelect={() => {
                    onChange(bank === value ? "" : bank)
                    setOpen(false)
                  }}
                  className="font-display"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === bank ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {bank}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
