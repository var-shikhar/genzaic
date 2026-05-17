import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getImageKitClientUploadConfig } from "@/lib/imagekit"

// GET /api/imagekit/auth — returns signed auth params + publicKey + upload
// endpoint URL so the browser can upload directly to ImageKit instead of
// shipping the file through this Next.js server. The signature is
// short-lived (default ~10 min) and only useful for write to ImageKit.
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await getImageKitClientUploadConfig()
    return NextResponse.json(params)
  } catch (error) {
    console.error("GET /api/imagekit/auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
