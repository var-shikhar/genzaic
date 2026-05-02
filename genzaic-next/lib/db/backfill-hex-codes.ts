import { loadEnvConfig } from "@next/env"
loadEnvConfig(process.cwd())

async function main() {
  // Dynamic imports so env is loaded before db connection initializes.
  const { db } = await import("@/lib/db")
  const { products } = await import("@/lib/db/schema/catalog")
  const { eq, isNull } = await import("drizzle-orm")
  const { generateHexCode } = await import("@/lib/brand/hex-code")

  const rows = await db
    .select({ id: products.id, storefrontId: products.storefrontId })
    .from(products)
    .where(isNull(products.hexCode))

  console.log(`Backfilling ${rows.length} products...`)

  const takenByStorefront = new Map<string, Set<string>>()

  for (const row of rows) {
    let taken = takenByStorefront.get(row.storefrontId)
    if (!taken) {
      const existing = await db
        .select({ hexCode: products.hexCode })
        .from(products)
        .where(eq(products.storefrontId, row.storefrontId))
      taken = new Set(existing.map((e) => e.hexCode).filter(Boolean) as string[])
      takenByStorefront.set(row.storefrontId, taken)
    }

    let code: string
    let attempts = 0
    do {
      code = generateHexCode()
      attempts++
      if (attempts > 100) throw new Error(`storefront ${row.storefrontId} hex space exhausted`)
    } while (taken.has(code))

    await db.update(products).set({ hexCode: code }).where(eq(products.id, row.id))
    taken.add(code)
  }

  console.log(`Backfilled ${rows.length} products.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
