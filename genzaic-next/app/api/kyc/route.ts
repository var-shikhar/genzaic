import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, kyc, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { kycSchema, KYC_FILE_LIMITS } from "@/lib/validations/kyc"
import {
  uploadToImageKit,
  deleteFromImageKit,
  IMAGEKIT_FOLDERS,
} from "@/lib/imagekit"

// GET /api/kyc — return the seller's KYC row (or null).
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id as string

    const [row] = await db
      .select()
      .from(kyc)
      .where(eq(kyc.userId, userId))
      .limit(1)

    return NextResponse.json(row ?? null)
  } catch (error) {
    console.error("GET /api/kyc error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/kyc — submit or resubmit KYC.
//
// Flow:
//  1. Auth + parse FormData (text fields + two files: panFile, aadhaarFile).
//  2. Zod-validate the text fields.
//  3. Validate file MIME / size; require both files on first submit. On
//     resubmit, allow keeping existing files when the seller didn't re-pick.
//  4. Upload (or re-upload) PAN + Aadhaar files to ImageKit, in parallel.
//     Delete old ImageKit objects when replacing.
//  5. Insert/update the kyc row with status=pending, vpaStatus=pending,
//     pennyDropStatus=pending.
//  6. Fire Razorpay validations (bank + VPA) in parallel.
//  7. Update the row with the validation results and a derived
//     verificationStatus (pending / rejected). Never auto-approve — admin
//     still reviews documents.
//  8. Mirror to users.kycStatus.
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id as string

    const [existing] = await db
      .select()
      .from(kyc)
      .where(eq(kyc.userId, userId))
      .limit(1)

    if (existing?.verificationStatus === "verified") {
      return NextResponse.json(
        { error: "KYC is already verified" },
        { status: 400 },
      )
    }

    // ─── Parse FormData ─────────────────────────────────────────────────────
    const formData = await req.formData()

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      // Files are pulled out separately below; everything else is a string.
      if (key !== "panFile" && key !== "aadhaarFile") {
        raw[key] = value === "" ? undefined : value
      }
    })

    const parsed = kycSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    const panFile = formData.get("panFile") as File | null
    const aadhaarFile = formData.get("aadhaarFile") as File | null

    const fileError = validateFile(panFile, "PAN")
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 })
    const aadhaarFileError = validateFile(aadhaarFile, "Aadhaar")
    if (aadhaarFileError) {
      return NextResponse.json({ error: aadhaarFileError }, { status: 400 })
    }

    // First-time submission must include both files. Resubmissions can keep
    // existing files when the seller didn't re-upload (existing != null and
    // file is null).
    if (!existing) {
      if (!panFile || panFile.size === 0) {
        return NextResponse.json(
          { error: "PAN document is required" },
          { status: 400 },
        )
      }
      if (!aadhaarFile || aadhaarFile.size === 0) {
        return NextResponse.json(
          { error: "Aadhaar document is required" },
          { status: 400 },
        )
      }
    }

    // ─── Upload (or re-upload) the files in parallel ────────────────────────
    const panUploadPromise: Promise<{ url: string; fileId: string } | null> =
      panFile && panFile.size > 0
        ? (async () => {
            const buffer = Buffer.from(await panFile.arrayBuffer())
            return uploadToImageKit(buffer, panFile.name, IMAGEKIT_FOLDERS.KYC)
          })()
        : Promise.resolve(null)

    const aadhaarUploadPromise: Promise<{ url: string; fileId: string } | null> =
      aadhaarFile && aadhaarFile.size > 0
        ? (async () => {
            const buffer = Buffer.from(await aadhaarFile.arrayBuffer())
            return uploadToImageKit(
              buffer,
              aadhaarFile.name,
              IMAGEKIT_FOLDERS.KYC,
            )
          })()
        : Promise.resolve(null)

    const [panUpload, aadhaarUpload] = await Promise.all([
      panUploadPromise,
      aadhaarUploadPromise,
    ])

    // Delete the old ImageKit objects for any document that was replaced.
    // Failures are swallowed — orphaned ImageKit assets are a minor cleanup
    // task, not a reason to fail the submit.
    if (panUpload && existing?.panFileId) {
      deleteFromImageKit(existing.panFileId).catch(() => {})
    }
    if (aadhaarUpload && existing?.aadhaarFileId) {
      deleteFromImageKit(existing.aadhaarFileId).catch(() => {})
    }

    const panFileUrl = panUpload?.url ?? existing?.panFileUrl ?? null
    const panFileId = panUpload?.fileId ?? existing?.panFileId ?? null
    const aadhaarFileUrl =
      aadhaarUpload?.url ?? existing?.aadhaarFileUrl ?? null
    const aadhaarFileId =
      aadhaarUpload?.fileId ?? existing?.aadhaarFileId ?? null

    // ─── Persist the row, statuses set to pending ────────────────────────────
    const {
      panNumber,
      aadhaarNumber,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    } = parsed.data

    const baseValues = {
      userId,
      panNumber,
      aadhaarNumber,
      panFileUrl,
      panFileId,
      aadhaarFileUrl,
      aadhaarFileId,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      // Reset all statuses on resubmit so the new validation results overwrite
      // any stale values from the previous submission.
      vpaStatus: "pending" as const,
      vpaHolderName: null,
      pennyDropStatus: "pending" as const,
      bankHolderName: null,
      verificationStatus: "pending" as const,
      rejectionReason: null,
      updatedAt: new Date(),
    }

    // Atomic: persist the kyc row AND mirror users.kycStatus so the two can
    // never drift. Now possible because we're on the Neon WebSocket driver
    // (the old neon-http driver didn't support transactions; see the
    // original commit that called this out).
    const row = await db.transaction(async (tx) => {
      let saved
      if (existing) {
        ;[saved] = await tx
          .update(kyc)
          .set(baseValues)
          .where(eq(kyc.userId, userId))
          .returning()
      } else {
        ;[saved] = await tx.insert(kyc).values(baseValues).returning()
      }
      await tx
        .update(users)
        .set({ kycStatus: "pending", updatedAt: new Date() })
        .where(eq(users.id, userId))
      return saved
    })

    // No auto-validation runs on submit. The row sits in pending state
    // until a future cron / admin tool flips verificationStatus. The seller
    // gets an email when that decision is made (separate path).
    return NextResponse.json(row, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error("POST /api/kyc error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/kyc — discard a non-verified submission. Verified records are
// immutable through this endpoint.
export async function DELETE(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id as string

    const [existing] = await db
      .select()
      .from(kyc)
      .where(eq(kyc.userId, userId))
      .limit(1)

    if (!existing) {
      return NextResponse.json(
        { error: "No KYC record found" },
        { status: 404 },
      )
    }
    if (existing.verificationStatus === "verified") {
      return NextResponse.json(
        { error: "Cannot delete a verified KYC record" },
        { status: 400 },
      )
    }

    if (existing.panFileId) {
      await deleteFromImageKit(existing.panFileId).catch(() => {})
    }
    if (existing.aadhaarFileId) {
      await deleteFromImageKit(existing.aadhaarFileId).catch(() => {})
    }
    if (existing.documentFileId) {
      await deleteFromImageKit(existing.documentFileId).catch(() => {})
    }

    await db.delete(kyc).where(eq(kyc.userId, userId))

    await db
      .update(users)
      .set({ kycStatus: "not_submitted", updatedAt: new Date() })
      .where(eq(users.id, userId))

    return NextResponse.json({ message: "KYC record deleted" })
  } catch (error) {
    console.error("DELETE /api/kyc error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns null if the file passes basic checks, else a user-facing error. */
function validateFile(file: File | null, label: string): string | null {
  if (!file || file.size === 0) return null // optional on resubmit; checked elsewhere
  if (file.size > KYC_FILE_LIMITS.maxBytes) {
    return `${label} document must be under 5 MB`
  }
  const accepted = KYC_FILE_LIMITS.acceptedMimes as readonly string[]
  if (file.type && !accepted.includes(file.type)) {
    return `${label} must be a JPG, PNG, or PDF`
  }
  return null
}

