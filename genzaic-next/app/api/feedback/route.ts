import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, feedbackSubmissions } from "@/lib/db"
import { feedbackSubmissionSchema } from "@/lib/feedback/schema"
import { sendFeedbackAdminEmail } from "@/lib/email"
import { enforceRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

/**
 * POST /api/feedback
 *
 * Persist a feature request or bug report from a logged-in user, then alert
 * the team by email (best-effort — a Resend failure must not fail the
 * submission, since the row is already saved).
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id as string

  const limited = await enforceRateLimit(req, `feedback:${userId}`, {
    max: 5,
    windowSec: 60,
  })
  if (limited) return limited

  const parsed = feedbackSubmissionSchema.safeParse(
    await req.json().catch(() => ({})),
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const input = parsed.data

  let id: string
  try {
    const [row] = await db
      .insert(feedbackSubmissions)
      .values({
        userId,
        kind: input.kind,
        title: input.title,
        description: input.description,
        attachments: input.attachments,
        pageUrl: input.kind === "bug_report" ? input.pageUrl ?? null : null,
        userAgent: input.kind === "bug_report" ? input.userAgent ?? null : null,
      })
      .returning({ id: feedbackSubmissions.id })
    id = row!.id
  } catch (err) {
    console.error("[feedback] insert failed:", err)
    return NextResponse.json(
      { error: "Could not save your submission. Please try again." },
      { status: 500 },
    )
  }

  // Best-effort alert. The submission already succeeded; never surface an
  // email failure to the user.
  try {
    await sendFeedbackAdminEmail({
      kind: input.kind,
      title: input.title,
      description: input.description,
      submitterName: session.user.name ?? "A GenZaic user",
      submitterEmail: session.user.email ?? "unknown@genzaic.com",
      attachments: input.attachments,
      pageUrl: input.pageUrl,
      userAgent: input.userAgent,
    })
  } catch (err) {
    console.error("[feedback] admin email failed (submission saved):", err)
  }

  return NextResponse.json({ ok: true, id }, { status: 201 })
}
