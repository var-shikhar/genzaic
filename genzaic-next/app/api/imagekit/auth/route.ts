import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getImageKitAuthParams } from "@/lib/imagekit"

// GET /api/imagekit/auth - ImageKit client-side auth parameters
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const params = await getImageKitAuthParams()

    return NextResponse.json(params)
  } catch (error) {
    console.error("GET /api/imagekit/auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
