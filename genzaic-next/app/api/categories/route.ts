import { NextResponse } from "next/server"
import { db, categories } from "@/lib/db"
import { eq, asc } from "drizzle-orm"

// GET /api/categories — flat list of active categories with parentId.
// Client builds the tree.
export async function GET() {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name))

    return NextResponse.json({ categories: rows })
  } catch (error) {
    console.error("GET /api/categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
