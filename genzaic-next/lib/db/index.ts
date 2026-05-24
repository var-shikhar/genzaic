import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import { env } from "@/lib/env"
import * as schema from "./schema"

// Bind a WebSocket constructor when running under Node (i.e. anywhere except
// the Edge runtime, which has a built-in WebSocket). Without this, Neon's
// driver throws on first query because Node has no global WebSocket.
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws
}

// Single shared Pool. With Neon's serverless driver each Pool maintains one
// WebSocket connection that's reused across queries — much cheaper than the
// previous neon-http driver, which paid a fresh TLS handshake per query and
// could not support transactions at all. On Vercel each warm Lambda gets one
// Pool that survives across requests for the lifetime of the container.
const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })

export * from "./schema"
