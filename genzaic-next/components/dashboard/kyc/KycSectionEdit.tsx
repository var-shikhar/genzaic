"use client"

import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import {
  kycSchema,
  KYC_FILE_LIMITS,
  type KycInput,
} from "@/lib/validations/kyc"
import { useSubmitKyc, type KycData } from "@/lib/queries/kyc"
import { getApiErrorMessage } from "@/lib/api-error"
import { Button } from "@/components/ui/button"
import { GenzaicLoader } from "@/components/ui/genzaic-loader"
import {
  EditorsHeadline,
  EyebrowLabel,
} from "@/components/brand/primitives"
import { StepIdentity } from "./StepIdentity"
import { StepPayment } from "./StepPayment"

export type EditSection = "identity" | "payment"

interface KycSectionEditProps {
  /** Existing kyc record. We pre-fill the form with these values so an
   *  "edit UPI only" save still posts every field the API requires. */
  existing: KycData
  /** Which section to render. The form only shows fields for this section,
   *  but submit sends the full KycInput so the API has everything. */
  section: EditSection
  /** Cancel button — returns the seller to the status view. */
  onCancel: () => void
}

/**
 * Compact, single-section edit form. Used after a rejection when only one
 * specific section needs updating (e.g. the bank account failed penny-drop,
 * so only the bank section is shown — not the full 3-step wizard).
 *
 * Submit posts every required field by combining the section's edited
 * values with the existing record's values, so the API never receives a
 * partial payload.
 */
export function KycSectionEdit({
  existing,
  section,
  onCancel,
}: KycSectionEditProps) {
  const submitKyc = useSubmitKyc()

  // Files staged locally (only relevant on the Identity section). Bank /
  // UPI edits don't touch documents — the API keeps the existing files.
  const [panFile, setPanFile] = useState<File | null>(null)
  const [panPreview, setPanPreview] = useState<string | null>(null)
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null)
  const blobUrls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const form = useForm<KycInput>({
    resolver: zodResolver(kycSchema),
    // Pre-fill EVERY field so submit can validate the whole record. The
    // section UI only exposes some of these for editing — the rest stay
    // at the existing values.
    defaultValues: {
      panNumber: existing.panNumber ?? "",
      aadhaarNumber: existing.aadhaarNumber ?? "",
      upiId: existing.upiId ?? "",
      accountHolderName: existing.accountHolderName ?? "",
      accountNumber: existing.accountNumber ?? "",
      // Confirm-account-number always blank to force a re-type if the
      // seller is editing the bank section.
      confirmAccountNumber:
        section === "payment" ? "" : existing.accountNumber ?? "",
      ifscCode: existing.ifscCode ?? "",
      bankName: existing.bankName ?? "",
    },
  })

  // ─── File staging ───────────────────────────────────────────────────────────

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

  // ─── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: KycInput) => {
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
      toast.success("— Updated. We're re-running verification.")
      onCancel() // return to status view; data refresh shows new status
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed"))
    }
  }

  const isSubmitting = submitKyc.isPending

  const sectionMeta =
    section === "identity"
      ? {
          eyebrow: "Edit · identity",
          headline: "Identity.",
          accent: "Identity.",
          deck: "Update your PAN or Aadhaar — and re-upload the document if it changed.",
        }
      : {
          eyebrow: "Edit · payment",
          headline: "Payment.",
          accent: "Payment.",
          deck: "Update your UPI handle or bank account — we'll re-verify both as soon as you save.",
        }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <header className="space-y-3">
          <EyebrowLabel>{sectionMeta.eyebrow}</EyebrowLabel>
          <EditorsHeadline accentWord={sectionMeta.accent} size="xl">
            {sectionMeta.headline}
          </EditorsHeadline>
          <p className="font-display italic text-base text-muted-foreground">
            {sectionMeta.deck}
          </p>
        </header>

        {section === "identity" ? (
          <StepIdentity
            panFile={panFile}
            panPreview={panPreview}
            panIsPdf={!!panIsPdf}
            panExistingUrl={existing.panFileUrl ?? null}
            onPickPan={(f) => stageFile("pan", f)}
            aadhaarFile={aadhaarFile}
            aadhaarPreview={aadhaarPreview}
            aadhaarIsPdf={!!aadhaarIsPdf}
            aadhaarExistingUrl={existing.aadhaarFileUrl ?? null}
            onPickAadhaar={(f) => stageFile("aadhaar", f)}
          />
        ) : (
          <StepPayment />
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            shape="pill"
            onClick={onCancel}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="submit"
            shape="pill"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <GenzaicLoader.Inline label="Saving" />
            ) : (
              "Save & re-verify"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

