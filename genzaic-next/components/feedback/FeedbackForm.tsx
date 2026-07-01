"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  type FeedbackKind,
} from "@/lib/feedback/schema"
import {
  uploadToImageKitFromBrowser,
  type ImageKitUploadResult,
} from "@/lib/imagekit/upload-client"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bug, FileText, Lightbulb, Loader2, Upload, X } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const ACCEPT = "image/png,image/jpeg,image/gif,image/webp,application/pdf"

const fieldsSchema = z.object({
  title: z.string().trim().min(1, "Please add a short title.").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Please describe it a little.")
    .max(5000),
})
type FieldValues = z.infer<typeof fieldsSchema>

interface UploadItem {
  id: string
  name: string
  status: "uploading" | "done" | "error"
  progress: number
  result?: ImageKitUploadResult
}

export function FeedbackForm({ defaultTab }: { defaultTab: FeedbackKind }) {
  const [tab, setTab] = React.useState<FeedbackKind>(defaultTab)

  return (
    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as FeedbackKind)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="feature_request" className="gap-2 py-2.5">
            <Lightbulb className="w-4 h-4" />
            Request a Feature
          </TabsTrigger>
          <TabsTrigger value="bug_report" className="gap-2 py-2.5">
            <Bug className="w-4 h-4" />
            Report a Bug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feature_request" className="mt-6">
          <FeedbackPanel
            kind="feature_request"
            titleLabel="What would you like to see?"
            titlePlaceholder="e.g. Bulk product upload"
            descriptionLabel="Tell us more"
            descriptionPlaceholder="Describe the feature and how it would help you…"
            allowAttachments={false}
          />
        </TabsContent>

        <TabsContent value="bug_report" className="mt-6">
          <FeedbackPanel
            kind="bug_report"
            titleLabel="What went wrong?"
            titlePlaceholder="e.g. Checkout button does nothing"
            descriptionLabel="Steps to reproduce / details"
            descriptionPlaceholder="What did you do, what happened, and what did you expect?"
            allowAttachments
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeedbackPanel({
  kind,
  titleLabel,
  titlePlaceholder,
  descriptionLabel,
  descriptionPlaceholder,
  allowAttachments,
}: {
  kind: FeedbackKind
  titleLabel: string
  titlePlaceholder: string
  descriptionLabel: string
  descriptionPlaceholder: string
  allowAttachments: boolean
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    resolver: zodResolver(fieldsSchema),
    defaultValues: { title: "", description: "" },
  })

  const [uploads, setUploads] = React.useState<UploadItem[]>([])
  const inputId = React.useId()
  const isUploading = uploads.some((u) => u.status === "uploading")

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      const current = uploads.length
      const room = MAX_ATTACHMENTS - current
      if (room <= 0) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} files.`)
        return
      }
      const picked = Array.from(files).slice(0, room)
      if (Array.from(files).length > room) {
        toast.error(
          `Only ${MAX_ATTACHMENTS} files allowed — extras were skipped.`,
        )
      }

      for (const file of picked) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`"${file.name}" is larger than 10 MB.`)
          continue
        }
        const id = `${file.name}-${file.size}-${current}-${Math.round(
          file.lastModified,
        )}`
        setUploads((prev) => [
          ...prev,
          { id, name: file.name, status: "uploading", progress: 0 },
        ])
        uploadToImageKitFromBrowser({
          file,
          folder: "feedback/bug-reports",
          onProgress: (f) =>
            setUploads((prev) =>
              prev.map((u) =>
                u.id === id ? { ...u, progress: Math.round(f * 100) } : u,
              ),
            ),
        })
          .then((result) =>
            setUploads((prev) =>
              prev.map((u) =>
                u.id === id
                  ? { ...u, status: "done", progress: 100, result }
                  : u,
              ),
            ),
          )
          .catch(() => {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: "error" } : u)),
            )
            toast.error(`Failed to upload "${file.name}".`)
          })
      }
    },
    [uploads.length],
  )

  const removeUpload = (id: string) =>
    setUploads((prev) => prev.filter((u) => u.id !== id))

  const onSubmit = async (values: FieldValues) => {
    if (isUploading) {
      toast.error("Please wait for attachments to finish uploading.")
      return
    }

    const attachments = uploads
      .filter((u) => u.status === "done" && u.result)
      .map((u) => ({
        url: u.result!.url,
        fileId: u.result!.fileId,
        name: u.result!.name,
        size: u.result!.size,
      }))

    const payload =
      kind === "bug_report"
        ? {
            kind,
            ...values,
            attachments,
            pageUrl:
              typeof document !== "undefined"
                ? document.referrer || undefined
                : undefined,
            userAgent:
              typeof navigator !== "undefined"
                ? navigator.userAgent
                : undefined,
          }
        : { kind, ...values }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 429) {
        toast.error("You're sending these too fast. Please wait a moment.")
        return
      }
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.")
        return
      }
      toast.success(
        kind === "bug_report"
          ? "Thanks — your bug report is in. We'll take a look."
          : "Thanks for the idea — it's been sent to the team!",
      )
      reset()
      setUploads([])
    } catch {
      toast.error("Network error. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${inputId}-title`}>{titleLabel}</Label>
        <Input
          id={`${inputId}-title`}
          placeholder={titlePlaceholder}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${inputId}-description`}>{descriptionLabel}</Label>
        <Textarea
          id={`${inputId}-description`}
          rows={6}
          placeholder={descriptionPlaceholder}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {allowAttachments && (
        <div className="space-y-2">
          <Label>Attachments (optional)</Label>
          <label
            htmlFor={`${inputId}-files`}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-4 py-6",
              "border-2 border-dashed border-border rounded-lg",
              "cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
            )}
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Drop screenshots or files, or click to upload
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              PNG · JPG · GIF · PDF · up to {MAX_ATTACHMENTS} files · 10 MB each
            </span>
          </label>
          <input
            id={`${inputId}-files`}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ""
            }}
          />

          {uploads.length > 0 && (
            <ul className="space-y-2 pt-1">
              {uploads.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  {u.status === "uploading" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                  ) : (
                    <FileText
                      className={cn(
                        "w-4 h-4 shrink-0",
                        u.status === "error"
                          ? "text-destructive"
                          : "text-primary",
                      )}
                    />
                  )}
                  <span className="flex-1 truncate">{u.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {u.status === "uploading"
                      ? `${u.progress}%`
                      : u.status === "error"
                        ? "Failed"
                        : "Ready"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUpload(u.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Remove ${u.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {kind === "bug_report" ? "Submit bug report" : "Submit request"}
      </Button>
    </form>
  )
}
