import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { loadPendingBatch, processOutboxRow } from "@/lib/notifications/worker"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!env.CRON_SECRET) {
    return new NextResponse("cron not configured", { status: 503 })
  }
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 })
  }

  try {
    const batch = await loadPendingBatch()
    for (const row of batch) {
      await processOutboxRow(row)
    }
    return NextResponse.json({ processed: batch.length })
  } catch (err) {
    console.error("[notifications-worker] fatal:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    )
  }
}
