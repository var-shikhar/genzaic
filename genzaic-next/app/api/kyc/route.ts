import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db, kyc, users } from "@/lib/db"
import { eq } from "drizzle-orm"
import { kycSchema } from "@/lib/validations/kyc"
import { uploadToImageKit, deleteFromImageKit, IMAGEKIT_FOLDERS } from "@/lib/imagekit"

// GET /api/kyc - get user's KYC data
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [kycRecord] = await db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1)

    return NextResponse.json(kycRecord ?? null)
  } catch (error) {
    console.error("GET /api/kyc error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/kyc - submit or resubmit KYC (with ImageKit for document)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    // Only allow submission if not already verified
    const [existing] = await db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1)
    if (existing?.verificationStatus === "verified") {
      return NextResponse.json({ error: "KYC is already verified" }, { status: 400 })
    }

    const formData = await req.formData()

    const raw: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      if (key !== "document") {
        raw[key] = value === "" ? undefined : value
      }
    })

    const parsed = kycSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Handle document upload
    let documentFileUrl = existing?.documentFileUrl ?? null
    let documentFileId = existing?.documentFileId ?? null
    const documentFile = formData.get("document") as File | null
    if (documentFile && documentFile.size > 0) {
      // Delete old document if resubmitting
      if (existing?.documentFileId) {
        await deleteFromImageKit(existing.documentFileId).catch(() => {})
      }
      const buffer = Buffer.from(await documentFile.arrayBuffer())
      const result = await uploadToImageKit(buffer, documentFile.name, IMAGEKIT_FOLDERS.KYC)
      documentFileUrl = result.url
      documentFileId = result.fileId
    }

    const { documentType, panNumber, aadhaarNumber, accountHolderName, accountNumber, ifscCode, bankName } = parsed.data

    const kycValues = {
      userId,
      documentType,
      panNumber: panNumber ?? null,
      aadhaarNumber: aadhaarNumber ?? null,
      documentFileUrl,
      documentFileId,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      verificationStatus: "pending" as const,
      pennyDropStatus: "pending" as const,
      updatedAt: new Date(),
    }

    let result
    if (existing) {
      ;[result] = await db.update(kyc).set(kycValues).where(eq(kyc.userId, userId)).returning()
    } else {
      ;[result] = await db.insert(kyc).values(kycValues).returning()
    }

    // Update user's kycStatus
    await db.update(users).set({ kycStatus: "pending", updatedAt: new Date() }).where(eq(users.id, userId))

    return NextResponse.json(result, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error("POST /api/kyc error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/kyc - delete KYC submission (only allowed if not verified)
export async function DELETE(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = session.user.id as string

    const [existing] = await db.select().from(kyc).where(eq(kyc.userId, userId)).limit(1)

    if (!existing) return NextResponse.json({ error: "No KYC record found" }, { status: 404 })
    if (existing.verificationStatus === "verified") {
      return NextResponse.json({ error: "Cannot delete a verified KYC record" }, { status: 400 })
    }

    // Delete document from ImageKit if present
    if (existing.documentFileId) {
      await deleteFromImageKit(existing.documentFileId).catch(() => {})
    }

    await db.delete(kyc).where(eq(kyc.userId, userId))

    // Reset user's kycStatus
    await db.update(users).set({ kycStatus: "not_submitted", updatedAt: new Date() }).where(eq(users.id, userId))

    return NextResponse.json({ message: "KYC record deleted" })
  } catch (error) {
    console.error("DELETE /api/kyc error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
