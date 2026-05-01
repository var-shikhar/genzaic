import { NextRequest, NextResponse } from "next/server"
import { db, tags } from "@/lib/db"
import { ilike, asc } from "drizzle-orm"

// GET /api/tags?search=<q> — up to 20 matches, case-insensitive.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("search") ?? "").trim()

    const builder = db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(tags)
      .orderBy(asc(tags.name))
      .limit(20)

    const rows = q
      ? await builder.where(ilike(tags.name, `%${q}%`))
      : await builder

    return NextResponse.json({ tags: rows })
  } catch (error) {
    console.error("GET /api/tags error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
