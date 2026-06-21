"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { KYC_FILE_LIMITS } from "@/lib/validations/kyc"

/**
 * Centralised state for the two KYC documents (PAN + Aadhaar).
 *
 * Both `KycWizard` and `KycSectionEdit` used to duplicate the file-staging
 * state, blob-URL lifecycle, and validation — and drilled 10 props into
 * `StepIdentity` / `StepReview`. The provider owns that state once; the
 * steps read it via `useKycDocuments()`.
 *
 * The wrapper supplies the existing-uploaded URLs (used as fallback
 * thumbnails on resubmit) and renders its form INSIDE the provider so
 * its own submit handler can read `panFile` / `aadhaarFile` via the hook.
 */
interface KycDocumentState {
  panFile: File | null
  panPreview: string | null
  panIsPdf: boolean
  panExistingUrl: string | null

  aadhaarFile: File | null
  aadhaarPreview: string | null
  aadhaarIsPdf: boolean
  aadhaarExistingUrl: string | null

  stageFile: (kind: "pan" | "aadhaar", file: File | null) => void
}

const KycDocumentCtx = createContext<KycDocumentState | null>(null)

interface ProviderProps {
  panExistingUrl: string | null
  aadhaarExistingUrl: string | null
  children: React.ReactNode
}

export function KycDocumentProvider({
  panExistingUrl,
  aadhaarExistingUrl,
  children,
}: ProviderProps) {
  const [panFile, setPanFile] = useState<File | null>(null)
  const [panPreview, setPanPreview] = useState<string | null>(null)
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null)
  const blobUrls = useRef<string[]>([])

  useEffect(() => {
    const urls = blobUrls.current
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

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

  const value = useMemo<KycDocumentState>(
    () => ({
      panFile,
      panPreview,
      panIsPdf: panFile?.type === "application/pdf",
      panExistingUrl,
      aadhaarFile,
      aadhaarPreview,
      aadhaarIsPdf: aadhaarFile?.type === "application/pdf",
      aadhaarExistingUrl,
      stageFile,
    }),
    [
      panFile,
      panPreview,
      panExistingUrl,
      aadhaarFile,
      aadhaarPreview,
      aadhaarExistingUrl,
    ],
  )

  return (
    <KycDocumentCtx.Provider value={value}>{children}</KycDocumentCtx.Provider>
  )
}

export function useKycDocuments(): KycDocumentState {
  const v = useContext(KycDocumentCtx)
  if (!v) {
    throw new Error(
      "useKycDocuments must be called inside a <KycDocumentProvider>",
    )
  }
  return v
}
