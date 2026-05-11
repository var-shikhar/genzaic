"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import {
  kycSchema,
  KYC_STEP_FIELDS,
  KYC_FILE_LIMITS,
  type KycInput,
} from "@/lib/validations/kyc"
import { useSubmitKyc, type KycData } from "@/lib/queries/kyc"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import { EditorsHeadline, EyebrowLabel } from "@/components/brand/primitives"
import {
  WizardProgress,
  WIZARD_STEP_ORDER,
  type WizardStep,
} from "./WizardProgress"
import { StepIdentity } from "./StepIdentity"
import { StepPayment } from "./StepPayment"
import { StepReview } from "./StepReview"

interface KycWizardProps {
  /** Existing record when seller is resubmitting; null on first-time. */
  existing: KycData | null
}

/**
 * 3-step KYC wizard: Identity → Payment → Review → Submit. The wizard holds
 * a single useForm instance for all fields; per-step navigation calls
 * form.trigger() with that step's subset to gate Next.
 */
export function KycWizard({ existing }: KycWizardProps) {
  const submitKyc = useSubmitKyc()
  const [step, setStep] = useState<WizardStep>("identity")
  const [completed, setCompleted] = useState<Set<WizardStep>>(new Set())

  // Files staged locally + blob URL previews. We don't put File objects
  // into the form state because react-hook-form serializes them awkwardly
  // and we need the actual File at submit time anyway.
  const [panFile, setPanFile] = useState<File | null>(null)
  const [panPreview, setPanPreview] = useState<string | null>(null)
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null)
  const blobUrls = useRef<string[]>([])

  // Cleanup blob URLs on unmount.
  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const form = useForm<KycInput>({
    resolver: zodResolver(kycSchema),
    defaultValues: useMemo(
      () => ({
        panNumber: existing?.panNumber ?? "",
        aadhaarNumber: existing?.aadhaarNumber ?? "",
        upiId: existing?.upiId ?? "",
        accountHolderName: existing?.accountHolderName ?? "",
        accountNumber: existing?.accountNumber ?? "",
        // Always force re-typing the confirm field on resubmit so the
        // mismatch-validation actually has something to compare to.
        confirmAccountNumber: "",
        ifscCode: existing?.ifscCode ?? "",
        bankName: existing?.bankName ?? "",
      }),
      [existing],
    ),
  })

  // ─── File staging ──────────────────────────────────────────────────────────

  const stageFile = (kind: "pan" | "aadhaar", file: File | null) => {
    if (file) {
      if (file.size > KYC_FILE_LIMITS.maxBytes) {
        toast.error("— File must be under 5 MB.")
        return
      }
      const accepted = KYC_FILE_LIMITS.acceptedMimes as readonly string[]
      if (file.type && !accepted.includes(file.type)) {
        toast.error("— File must be a JPG, PNG, or PDF.")
        return
      }
    }

    const url = file ? URL.createObjectURL(file) : null
    if (url) blobUrls.current.push(url)

    if (kind === "pan") {
      setPanFile(file)
      setPanPreview(url)
    } else {
      setAadhaarFile(file)
      setAadhaarPreview(url)
    }
  }

  const panIsPdf = panFile?.type === "application/pdf"
  const aadhaarIsPdf = aadhaarFile?.type === "application/pdf"

  // ─── Step navigation ───────────────────────────────────────────────────────

  const advance = async () => {
    if (step === "identity") {
      const ok = await form.trigger(KYC_STEP_FIELDS.identity)
      if (!ok) return
      // Both files required to advance — either freshly picked or carried
      // over from a previous submission.
      const haveBothFiles =
        (panFile || existing?.panFileUrl) &&
        (aadhaarFile || existing?.aadhaarFileUrl)
      if (!haveBothFiles) {
        toast.error("— Both PAN and Aadhaar documents are required.")
        return
      }
      setCompleted((prev) => new Set(prev).add("identity"))
      setStep("payment")
      return
    }
    if (step === "payment") {
      const ok = await form.trigger(KYC_STEP_FIELDS.payment)
      if (!ok) return
      setCompleted((prev) => new Set(prev).add("payment"))
      setStep("review")
      return
    }
  }

  const retreat = () => {
    const idx = WIZARD_STEP_ORDER.indexOf(step)
    if (idx > 0) setStep(WIZARD_STEP_ORDER[idx - 1])
  }

  const jumpTo = (target: WizardStep) => {
    // Only allow jumping to a step the seller has already completed.
    if (!completed.has(target)) return
    setStep(target)
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: KycInput) => {
    // Defensive double-check: if files weren't carried from a previous
    // submission, they must be present locally.
    if (!panFile && !existing?.panFileUrl) {
      toast.error("— PAN document is required.")
      setStep("identity")
      return
    }
    if (!aadhaarFile && !existing?.aadhaarFileUrl) {
      toast.error("— Aadhaar document is required.")
      setStep("identity")
      return
    }

    const fd = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "confirmAccountNumber") return
      if (value !== undefined && value !== null && value !== "") {
        fd.append(key, String(value))
      }
    })
    if (panFile) fd.append("panFile", panFile)
    if (aadhaarFile) fd.append("aadhaarFile", aadhaarFile)

    try {
      await submitKyc.mutateAsync(fd)
      toast.success(
        "— KYC submitted. We're verifying your bank and UPI now.",
      )
      // Page-level branching (KycPanel) re-renders into the status view
      // because verificationStatus is now `pending` or `rejected`.
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Submission failed"))
    }
  }

  const isSubmitting = submitKyc.isPending

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Header */}
        <header className="space-y-3">
          <EyebrowLabel>Verification · payouts above ₹10k</EyebrowLabel>
          <EditorsHeadline accentWord="Credentials." size="xl">
            Your Credentials.
          </EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground">
            Five-minute job. Lift the payout cap.
          </p>
        </header>

        {/* Rejection banner — shown on resubmit */}
        {existing?.verificationStatus === "rejected" &&
          existing.rejectionReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Previous submission was rejected</AlertTitle>
              <AlertDescription>{existing.rejectionReason}</AlertDescription>
            </Alert>
          )}

        {/* Progress strip */}
        <WizardProgress
          current={step}
          completed={completed}
          onJump={jumpTo}
        />

        {/* Step body */}
        {step === "identity" && (
          <StepIdentity
            panFile={panFile}
            panPreview={panPreview}
            panIsPdf={!!panIsPdf}
            panExistingUrl={existing?.panFileUrl ?? null}
            onPickPan={(f) => stageFile("pan", f)}
            aadhaarFile={aadhaarFile}
            aadhaarPreview={aadhaarPreview}
            aadhaarIsPdf={!!aadhaarIsPdf}
            aadhaarExistingUrl={existing?.aadhaarFileUrl ?? null}
            onPickAadhaar={(f) => stageFile("aadhaar", f)}
          />
        )}
        {step === "payment" && <StepPayment />}
        {step === "review" && (
          <StepReview
            panFile={panFile}
            panPreview={panPreview}
            panIsPdf={!!panIsPdf}
            panExistingUrl={existing?.panFileUrl ?? null}
            aadhaarFile={aadhaarFile}
            aadhaarPreview={aadhaarPreview}
            aadhaarIsPdf={!!aadhaarIsPdf}
            aadhaarExistingUrl={existing?.aadhaarFileUrl ?? null}
            onEdit={(target) => {
              // Treat all three as completed once you've reached review,
              // so jumping back works from the strip too.
              setCompleted(
                (prev) =>
                  new Set([...prev, "identity", "payment"] as WizardStep[]),
              )
              setStep(target)
            }}
          />
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            shape="pill"
            onClick={retreat}
            disabled={step === "identity" || isSubmitting}
          >
            Back
          </Button>

          {step !== "review" ? (
            <Button
              type="button"
              shape="pill"
              onClick={advance}
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              shape="pill"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <GenzaicLoader.Inline label="Verifying" />
              ) : (
                "Submit for verification"
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
