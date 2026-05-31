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

// HMR-safe Pool singleton. Next.js dev re-evaluates this module on every
// hot reload — without the globalThis guard, each reload spawned a new
// Pool + WebSocket while old ones dangled, eventually exhausting Neon's
// per-IP connection cap and surfacing as a 500 on /api/notifications/
// unread-count (the polling query that fires first after a reload). On
// Vercel each warm Lambda is a fresh process, so the global cache is a
// no-op there.
type GlobalWithPool = typeof globalThis & { __neonPool?: Pool }
const globalForPool = globalThis as GlobalWithPool

const pool =
  globalForPool.__neonPool ??
  new Pool({ connectionString: env.DATABASE_URL })

if (process.env.NODE_ENV !== "production") {
  globalForPool.__neonPool = pool
}

export const db = drizzle(pool, { schema })

export * from "./schema"
