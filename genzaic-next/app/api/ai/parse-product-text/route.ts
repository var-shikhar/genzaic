import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { env } from "@/lib/env"
import { enforceRateLimit } from "@/lib/rate-limit"

const parseTextSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(10000, "Text is too long"),
})

const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)

// Each chunk from Gemini Flash typically arrives in <500ms. 6s headroom
// catches a stuck stream without false positives on slow networks.
const PER_CHUNK_TIMEOUT_MS = 6_000
// Total wall-clock budget per attempt. Gemini Flash usually finishes a
// ~500-token product extraction inside 4–6s; 15s is comfortably above p99.
const TOTAL_TIMEOUT_MS = 15_000

function buildPrompt(text: string) {
  return `You are a product catalog assistant. Extract product information from the following text and return a JSON array of products.

For each product identified, extract:
- title (string, required): Clear product name
- description (string): Brief product description
- price (number, optional): Price in INR (rupees), if mentioned
- originalPrice (number, optional): Original/MRP price if there's a discount mentioned
- subscriptionDuration (string, optional): One of "1 month", "3 months", "6 months", "1 year", "lifetime" if applicable

Return ONLY a valid JSON object like this (no markdown, no code blocks):
{"products": [...], "count": N}

Text to analyze:
${text}`
}

// Stream one Gemini attempt into the response controller. Per-chunk and
// total-time guards prevent a wedged generation from blocking the route
// until the platform's serverless timeout fires.
async function streamOnceInto(
  enqueue: (chunk: Uint8Array) => void,
  encoder: TextEncoder,
  prompt: string,
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const startedAt = Date.now()
  const { stream } = await model.generateContentStream(prompt)
  const iter = stream[Symbol.asyncIterator]()

  while (true) {
    if (Date.now() - startedAt > TOTAL_TIMEOUT_MS) {
      throw new Error("AI generation exceeded total time budget")
    }
    const next = await Promise.race([
      iter.next(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("AI generation stalled (no chunk)")),
          PER_CHUNK_TIMEOUT_MS,
        ),
      ),
    ])
    if (next.done) break
    const text = next.value.text()
    if (text) enqueue(encoder.encode(text))
  }
}

// POST /api/ai/parse-product-text — streams Gemini's raw output as
// text/plain. The client accumulates chunks for live UI feedback and
// parses the final JSON once the stream completes.
export async function POST(req: NextRequest) {
  // 10 generations per IP per hour. Each call costs real money — without a
  // cap an attacker (or runaway client retry) could exhaust the Gemini
  // budget in minutes. Legitimate sellers extract a handful of products at
  // a time and won't notice this ceiling.
  const limited = await enforceRateLimit(req, "ai-parse", { max: 10, windowSec: 3600 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = parseTextSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const prompt = buildPrompt(parsed.data.text)
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let hasEnqueued = false
      const enqueue = (chunk: Uint8Array) => {
        hasEnqueued = true
        controller.enqueue(chunk)
      }

      try {
        try {
          await streamOnceInto(enqueue, encoder, prompt)
        } catch (err) {
          // Retry once IFF we haven't streamed anything yet — once a partial
          // payload has hit the wire, the client cannot meaningfully recover
          // by appending a second attempt to it.
          if (hasEnqueued) throw err
          console.warn("ai.parse_product_text first attempt failed, retrying:", err)
          await streamOnceInto(enqueue, encoder, prompt)
        }
        controller.close()
      } catch (err) {
        console.error("POST /api/ai/parse-product-text stream error:", err)
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      // Hint to proxies (nginx etc.) not to buffer — preserves chunked TTFB.
      "X-Accel-Buffering": "no",
    },
  })
}
