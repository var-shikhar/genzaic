import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const parseTextSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(10000, "Text is too long"),
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "")

// POST /api/ai/parse-product-text - extract product details from raw text using Gemini
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = parseTextSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { text } = parsed.data

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a product catalog assistant. Extract product information from the following text and return a JSON array of products.

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

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Strip markdown code blocks if present
    const cleaned = responseText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim()

    let parsed2: { products: unknown[]; count: number }
    try {
      parsed2 = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Validate structure
    if (!Array.isArray(parsed2.products)) {
      return NextResponse.json({ products: [], count: 0 })
    }

    const validProducts = parsed2.products
      .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
      .map((p) => ({
        title: typeof p.title === "string" ? p.title : "",
        description: typeof p.description === "string" ? p.description : "",
        price: typeof p.price === "number" ? p.price : undefined,
        originalPrice: typeof p.originalPrice === "number" ? p.originalPrice : undefined,
        subscriptionDuration:
          typeof p.subscriptionDuration === "string" ? p.subscriptionDuration : undefined,
      }))
      .filter((p) => p.title.length > 0)

    return NextResponse.json({ products: validProducts, count: validProducts.length })
  } catch (error) {
    console.error("POST /api/ai/parse-product-text error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
