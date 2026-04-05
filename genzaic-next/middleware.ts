import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/about", "/disclaimer", "/privacy-policy", "/terms", "/refund-policy", "/login", "/signup", "/forgot-password", "/verify-email", "/reset-password"]
const publicPrefixes = ["/store", "/checkout", "/download", "/api/auth", "/api/storefront/public", "/api/checkout/product"]
const sellerRoutes = ["/dashboard", "/onboarding", "/plan-selection"]
const buyerRoutes = ["/my-purchases"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth()

  const isPublic = publicRoutes.includes(pathname) || publicPrefixes.some((p) => pathname.startsWith(p))

  if (isPublic) {
    if (session && (pathname === "/login" || pathname === "/signup")) {
      const user = session.user as any
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

  const user = session.user as any
  const isSeller = user?.role === "seller" || user?.isSeller

  if (sellerRoutes.some((r) => pathname.startsWith(r)) && !isSeller) {
    return NextResponse.redirect(new URL("/my-purchases", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
