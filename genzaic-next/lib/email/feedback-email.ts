/**
 * Pure builder for the admin-facing feedback notification email.
 *
 * Side-effect-free (no Resend, no env) so the subject/body can be unit-tested.
 * `sendFeedbackAdminEmail` in ./index.ts wraps this and dispatches via Resend.
 */

export interface FeedbackEmailAttachment {
  url: string
  name: string
  size: number
}

export interface FeedbackEmailParams {
  kind: "feature_request" | "bug_report"
  title: string
  description: string
  submitterName: string
  submitterEmail: string
  attachments?: FeedbackEmailAttachment[]
  pageUrl?: string | null
  userAgent?: string | null
}

export interface FeedbackEmail {
  subject: string
  html: string
}

const KIND_LABEL: Record<FeedbackEmailParams["kind"], string> = {
  feature_request: "Feature Request",
  bug_report: "Bug Report",
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildFeedbackAdminEmail(params: FeedbackEmailParams): FeedbackEmail {
  const label = KIND_LABEL[params.kind]
  const subject = `[${label}] ${params.title}`

  const attachments = params.attachments ?? []
  const attachmentsBlock = attachments.length
    ? `
        <h3 style="color: #1f2937; font-size: 15px; margin: 20px 0 8px;">Attachments (${attachments.length})</h3>
        <ul style="margin: 0; padding-left: 18px; color: #6366f1;">
          ${attachments
            .map(
              (a) =>
                `<li><a href="${escapeHtml(a.url)}" style="color: #6366f1;">${escapeHtml(a.name)}</a></li>`,
            )
            .join("")}
        </ul>`
    : ""

  const contextRows: string[] = []
  if (params.pageUrl) {
    contextRows.push(
      `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>Page:</strong> ${escapeHtml(params.pageUrl)}</p>`,
    )
  }
  if (params.userAgent) {
    contextRows.push(
      `<p style="margin: 4px 0; color: #6b7280; font-size: 13px;"><strong>User agent:</strong> ${escapeHtml(params.userAgent)}</p>`,
    )
  }
  const contextBlock = contextRows.length
    ? `<div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-top: 16px;">${contextRows.join("")}</div>`
    : ""

  const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <p style="color: rgba(255,255,255,0.85); margin: 0 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">${label}</p>
          <h1 style="color: white; margin: 0; font-size: 22px;">${escapeHtml(params.title)}</h1>
        </div>
        <p style="color: #6b7280; margin: 0 0 16px;">
          From <strong>${escapeHtml(params.submitterName)}</strong>
          (<a href="mailto:${escapeHtml(params.submitterEmail)}" style="color: #6366f1;">${escapeHtml(params.submitterEmail)}</a>)
        </p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; white-space: pre-wrap; color: #374151;">${escapeHtml(params.description)}</div>
        ${attachmentsBlock}
        ${contextBlock}
      </div>
    `

  return { subject, html }
}
