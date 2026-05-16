"use client"

import * as React from "react"
import Image from "next/image"
import { FileText, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { KYC_FILE_LIMITS } from "@/lib/validations/kyc"

interface KycDocumentDropProps {
  /** Local blob URL for the staged file, OR a remote URL to a previously
   *  uploaded document. Undefined = nothing picked yet. */
  preview: string | null
  /** Filename (or any caption) to show under the preview. PDF previews can't
   *  show a thumbnail so the filename is the only visual signal. */
  fileName?: string | null
  /** True if the preview points to a PDF — we show a doc icon instead of an
   *  Image. The page determines this from the File's MIME type. */
  isPdf?: boolean
  /** Called with `null` when the seller clears the picked file. */
  onPick: (file: File | null) => void
  /** Form-validation hint, shown beneath the dropzone. */
  helpText?: string
  /** Aspect ratio class, e.g. "aspect-[4/3]". Compact 4:3 by default — the
   *  old 3:2 made the dropzone uncomfortably tall when paired with a
   *  narrow input next to it. */
  aspect?: string
  className?: string
  hasAspect?: boolean
}

const ACCEPT_ATTR = KYC_FILE_LIMITS.acceptedMimes.join(",")

/**
 * Drop-zone that accepts a single image (JPG/PNG) or PDF up to 5 MB. Used for
 * PAN and Aadhaar uploads in the KYC wizard.
 *
 * Image previews render as a thumbnail. PDFs render as a centered file icon
 * with the filename below — there's no thumbnail because rendering PDFs
 * inline would pull in pdf.js and isn't worth the bundle for a small ack.
 */
export function KycDocumentDrop({
  preview,
  fileName,
  isPdf,
  onPick,
  helpText,
  aspect = "aspect-[4/3]",
  className,
  hasAspect = true,
}: KycDocumentDropProps) {
  const inputId = React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div
          className={cn(
            "relative overflow-hidden border border-foreground/15 rounded-lg bg-muted/30 h-40",
            hasAspect && aspect,
          )}
        >
          {isPdf ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3">
              <FileText className="w-10 h-10 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                PDF
              </span>
              {fileName && (
                <span className="font-display italic text-xs text-muted-foreground text-center break-all line-clamp-2">
                  {fileName}
                </span>
              )}
            </div>
          ) : (
            <Image
              src={preview}
              alt={fileName ?? "Uploaded document"}
              fill
              sizes="320px"
              className="object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => onPick(null)}
            className="absolute top-2 right-2 p-1 bg-foreground/70 rounded-full hover:bg-foreground transition-colors"
            aria-label="Remove document"
          >
            <X className="h-3.5 w-3.5 text-background" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "flex flex-col items-center justify-center gap-2 px-4 py-8",
            "border-2 border-dashed border-border rounded-lg",
            "cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
            hasAspect && aspect,
          )}
        >
          <Upload className="w-5 h-5 text-muted-foreground" />
          <span className="font-display italic text-[12px] text-muted-foreground text-center">
            Drop a file or click to upload
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
            JPG · PNG · PDF · max 5MB
          </span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          if (file.size > KYC_FILE_LIMITS.maxBytes) {
            // Still pass it up — the page-level submit handler will surface
            // the error message via toast. We don't reject silently here so
            // the seller doesn't think their click did nothing.
          }
          onPick(file)
          e.target.value = ""
        }}
      />

      {helpText && (
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {helpText}
        </p>
      )}
    </div>
  )
}
