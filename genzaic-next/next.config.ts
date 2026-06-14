import type { NextConfig } from "next"
import withSerwistInit from "@serwist/next"

/**
 * Security headers applied to every response. Tightened for a commerce
 * app exposing public storefronts.
 *
 * Note: `Content-Security-Policy` is intentionally not set here yet —
 * adding a strict CSP requires auditing every inline style/script the
 * editorial OS relies on (framer-motion, next/image blur placeholders,
 * etc.). Tracked as a follow-up.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HSTS is opt-in via reverse proxy in dev; in prod the platform
  // (Vercel) usually injects this. Left commented to avoid surprising
  // local HTTPS users.
  // { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Server-side native packages that should NOT be bundled by webpack —
  // they need to be required at runtime from node_modules.
  serverExternalPackages: ["bcryptjs", "imagekit"],
  compiler: {
    // Strip console.log in production builds but keep error/warn for ops.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

// Serwist generates the service worker (public/sw.js) from app/sw.ts at
// build time. Disabled in dev so HMR isn't shadowed by a cached SW.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Reload open clients once a new SW takes control.
  reloadOnOnline: true,
})

export default withSerwist(nextConfig)
