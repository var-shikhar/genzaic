import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = [
  "/",
  "/about",
  "/disclaimer",
  "/privacy-policy",
  "/terms",
  "/refund-policy",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
]
const publicPrefixes = [
  "/store",
  "/checkout",
  "/download",
  "/api/auth",
  "/api/storefront/public",
  "/api/checkout/product",
]
const sellerRoutes = ["/dashboard", "/onboarding", "/plan-selection"]

// Routes where we need to *also* check auth (to redirect logged-in users
// away from the auth pages). Everything else in publicRoutes/publicPrefixes
// passes through with no DB hit.
const authAwarePublicRoutes = new Set(["/login", "/signup"])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PERF: Public routes are the bulk of incoming traffic (storefronts,
  // landing page, public API). Short-circuit BEFORE calling `auth()` so
  // anonymous traffic never pays the session-decode cost. The auth-aware
  // public routes (login/signup) opt in to the auth check below.
  const isPublic =
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p))

  if (isPublic && !authAwarePublicRoutes.has(pathname)) {
    return NextResponse.next()
  }

  const session = await auth()

  if (isPublic) {
    // Only login/signup reach here. Redirect already-authenticated users.
    if (session && (pathname === "/login" || pathname === "/signup")) {
      const user = session.user as { role?: string; isSeller?: boolean } | undefined
      if (user?.role === "seller" || user?.isSeller) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      return NextResponse.redirect(new URL("/my-purchases", request.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = session.user as { role?: string; isSeller?: boolean } | undefined
  const isSeller = user?.role === "seller" || user?.isSeller

  if (sellerRoutes.some((r) => pathname.startsWith(r)) && !isSeller) {
    return NextResponse.redirect(new URL("/my-purchases", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Excludes static assets, API public-storefront (already public), and
  // anything with a file extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
