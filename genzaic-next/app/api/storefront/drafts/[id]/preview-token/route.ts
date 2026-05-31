import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import crypto from "node:crypto"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db, storefrontDrafts } from "@/lib/db"
import { getDraftByIdForUser } from "@/lib/db/storefront-helpers"

const bodySchema = z.object({ enabled: z.boolean() })

interface Ctx {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id as string
  const { id } = await ctx.params

  const draft = await getDraftByIdForUser(id, userId)
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 })
  }

  const nextToken = parsed.data.enabled
    ? crypto.randomBytes(24).toString("base64url")
    : null

  const [updated] = await db
    .update(storefrontDrafts)
    .set({ previewToken: nextToken, updatedAt: new Date() })
    .where(eq(storefrontDrafts.id, id))
    .returning()

  return NextResponse.json({ previewToken: updated.previewToken })
}
