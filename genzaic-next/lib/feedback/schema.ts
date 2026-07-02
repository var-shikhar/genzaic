import { z } from "zod"

/**
 * Shared validation for the feedback API.
 *
 * Kept framework-free (no `next/server`, no db) so it can be unit-tested in
 * isolation and imported by both the route handler and the client form.
 */

export const FEEDBACK_KINDS = ["feature_request", "bug_report"] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

/** Max attachments per bug report. Mirrors the dropzone cap in the UI. */
export const MAX_ATTACHMENTS = 5
export const MIN_DESCRIPTION_LENGTH = 20

/** Max attachment size accepted by the UI (10 MB). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

export const attachmentSchema = z.object({
  url: z.string().url(),
  fileId: z.string().min(1),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
})

export const feedbackSubmissionSchema = z
  .object({
    kind: z.enum(FEEDBACK_KINDS),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(MIN_DESCRIPTION_LENGTH).max(5000),
    attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS).default([]),
    pageUrl: z.string().max(2000).optional(),
    userAgent: z.string().max(1000).optional(),
  })
  .refine((v) => v.kind === "bug_report" || v.attachments.length === 0, {
    message: "Attachments are only allowed on bug reports.",
    path: ["attachments"],
  })

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>
