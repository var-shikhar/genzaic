import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

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
  "/order",
  "/api/auth",
  "/api/storefront/public",
  "/api/checkout/product",
  "/api/checkout/create-order",
  // Guest buyers (not logged in) must be able to confirm their payment.
  // Secured by the Razorpay HMAC signature, not the session.
  "/api/checkout/verify-payment",
  "/api/checkout/order",
  "/api/checkout/record-download",
  // Razorpay's servers call this and are never authenticated — it is secured
  // by the webhook signature. Must bypass session auth or it 307s to /login.
  "/api/webhooks",
]
// `/onboarding` is intentionally NOT in this list — it doubles as the
// buyer-to-seller upgrade entry point. `POST /api/onboarding/plan` is what
// actually flips `isSeller: true` + `role: "seller"`, so buyers must be
// allowed to land there. After plan pick, normal seller-only gating resumes.
// `/plan-selection` legacy route now redirects here (see app/plan-selection).
const sellerRoutes = ["/dashboard"]

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
      const user = session.user as { role?: string; isSeller?: boolean; onboardingComplete?: boolean } | undefined
      if (user?.role === "seller" || user?.isSeller) {
        if (!user?.onboardingComplete) {
          return NextResponse.redirect(new URL("/onboarding", request.url))
        }
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

  const user = session.user as { role?: string; isSeller?: boolean; onboardingComplete?: boolean } | undefined
  const isSeller = user?.role === "seller" || user?.isSeller

  if (sellerRoutes.some((r) => pathname.startsWith(r)) && !isSeller) {
    return NextResponse.redirect(new URL("/my-purchases", request.url))
  }

  // A seller who already finished onboarding has no business on /onboarding
  // again — kick them straight to /dashboard. Buyers (upgrade flow) and
  // sellers with onboardingComplete=false are both allowed through.
  if (pathname.startsWith("/onboarding") && isSeller && user?.onboardingComplete) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Sellers with incomplete onboarding get bounced back to /onboarding from
  // anywhere else (e.g. /dashboard) so they finish setup.
  if (
    isSeller &&
    !user?.onboardingComplete &&
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Excludes static assets, API public-storefront (already public), and
  // anything with a file extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
